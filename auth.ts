import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPgSimple from "connect-pg-simple";
import { pool, db } from "./db";
import { storage } from "./storage";
import { User as SelectUser, enrollmentCodes } from "@shared/schema";
import { eq, isNull, gte } from "drizzle-orm";
import nodemailer from "nodemailer";
import { sessionTracker } from "./services/sessionTracker";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Configure email transporter for password reset
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email", // Default to ethereal for testing
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const scryptAsync = promisify(scrypt);

/**
 * Hash a password with a random salt
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password against a stored hash
 */
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a password reset token
 */
export function generateResetToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Set up authentication middleware and routes
 */
export function setupAuth(app: Express) {
  // Set up session store with PostgreSQL
  const PgSessionStore = connectPgSimple(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "finesse-academy-secret-key",
    resave: true, // Always save session regardless of changes
    saveUninitialized: true, // Save uninitialized sessions
    rolling: true, // Reset expiration with each request
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Must be false for all non-HTTPS environments
      sameSite: "lax",
      path: '/', // Ensure cookie is sent with all requests
    },
    store: new PgSessionStore({
      pool,
      tableName: "session", // Default session table name
      createTableIfMissing: true,
      pruneSessionInterval: 60, // Prune expired sessions every 60 seconds
    }),
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local username/password strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // User registration
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Validate enrollment code
      if (!req.body.enrollmentCode) {
        return res.status(400).json({ message: "Temporary authorization code is required" });
      }
      
      // Validate enrollment code against the database
      try {
        // Check the enrollment code in the database
        const enrollmentCodesResult = await db
          .select()
          .from(enrollmentCodes)
          .where(eq(enrollmentCodes.code, req.body.enrollmentCode));
          
        // Evaluate the results
        const enrollmentCode = enrollmentCodesResult.length > 0 ? enrollmentCodesResult[0] : null;
          
        if (!enrollmentCode) {
          return res.status(400).json({ message: "Invalid enrollment code" });
        }
        
        if (enrollmentCode.isUsed) {
          return res.status(400).json({ message: "Enrollment code has already been used" });
        }
        
        if (enrollmentCode.expiresAt && new Date(enrollmentCode.expiresAt) < new Date()) {
          return res.status(400).json({ message: "Enrollment code has expired" });
        }
        
        // Extract state code from the authorization code (first two letters)
        const stateCode = enrollmentCode.code.substring(0, 2);
        console.log(`Registration with code from state: ${stateCode}`);
      } catch (error) {
        console.error("Error validating enrollment code:", error);
        return res.status(500).json({ message: "Error validating enrollment code" });
      }
      
      // Generate a unique 7-digit student ID
      const { generateStudentId } = require("@shared/schema");
      const studentId = generateStudentId();
      
      console.log(`Generated student ID ${studentId} for user ${req.body.username}`);
      
      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user with the generated student ID
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        studentId,
        isInstructor: false, // Default to regular user
      });
      
      // Mark the enrollment code as used
      try {
        await db
          .update(enrollmentCodes)
          .set({
            isUsed: true,
            usedBy: user.id,
            usedAt: new Date()
          })
          .where(eq(enrollmentCodes.code, req.body.enrollmentCode));
        
        console.log(`Marked enrollment code ${req.body.enrollmentCode} as used by user ID ${user.id}`);
      } catch (err) {
        console.error("Error marking enrollment code as used:", err);
        // Continue anyway - user is already created
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Notify admin about new registration (would implement notification service in a real app)
        console.log(`ADMIN NOTIFICATION: New user registered - Username: ${user.username}, Email: ${user.email}, Student ID: ${user.studentId}`);
        
        try {
          // In a real app, this would create a notification for admins
          // const adminUsers = await storage.getAdmins();
          // for (const admin of adminUsers) {
          //   await storage.createNotification({
          //     userId: admin.id,
          //     title: "New Student Registration",
          //     content: `New student registered: ${user.username} - Student ID: ${user.studentId}`,
          //     type: "system",
          //   });
          // }
        } catch (notifyError) {
          console.error("Error notifying admins about new registration:", notifyError);
          // Continue anyway, this shouldn't block the registration
        }
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Simplified user login with error handling and descriptive messages
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt received");
    
    // Check for required fields
    if (!req.body.username || !req.body.password || !req.body.studentId) {
      console.log("Login attempt missing required fields");
      return res.status(400).json({ message: "Username, password, and student ID are required" });
    }
    
    // Trim username and clean inputs
    const username = String(req.body.username).trim();
    const password = String(req.body.password);
    const studentId = String(req.body.studentId).trim();
    
    // Track device type (simplified)
    const userAgent = req.headers['user-agent'] || 'unknown';
    const isMobileFromUA = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const deviceType = req.body.deviceType || (isMobileFromUA ? 'mobile' : 'desktop');
    
    console.log(`Login attempt for username: ${username} from device type: ${deviceType}`);
    
    // First step - find the user directly
    storage.getUserByUsername(username)
      .then(async (user) => {
        if (!user) {
          console.log(`Login failed: User ${username} not found`);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        try {
          // Check password match
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.log(`Login failed: Invalid password for ${username}`);
            return res.status(401).json({ message: "Invalid username or password" });
          }
          
          // Check student ID match
          if (!user.studentId || user.studentId !== studentId) {
            console.log(`Login failed: Invalid student ID for ${username}. Expected: ${user.studentId}, Received: ${studentId}`);
            return res.status(401).json({ message: "Invalid Student ID" });
          }
          
          console.log(`Password and Student ID verified for user ${username}`);
          
          // Use Passport login to maintain session auth
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.error("Passport session login error:", loginErr);
              return res.status(500).json({ message: "Error during login process" });
            }
            
            // Return user data without password
            const { password, ...userWithoutPassword } = user;
            
            console.log(`Login successful for ${username}`);
            res.json({
              ...userWithoutPassword,
              sessionId: req.sessionID,
              deviceType,
              loginTimestamp: new Date().toISOString()
            });
          });
        } catch (error) {
          console.error("Error during password verification:", error);
          return res.status(500).json({ message: "Server error during login verification" });
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
      });
  });

  // User logout - Enhanced with better session cleanup
  app.post("/api/logout", (req, res, next) => {
    console.log("Logout attempt received");
    
    // Get the username for logging if authenticated
    const username = req.user?.username;
    
    // Even if not authenticated, we'll clean up the session
    if (!req.isAuthenticated()) {
      console.log("Logout called but user was not authenticated");
      // Still destroy the session to clean up any lingering data
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction error for unauthenticated user:", err);
          }
          res.clearCookie('connect.sid'); // Clear the session cookie
          return res.status(200).json({ message: "Logged out" });
        });
      } else {
        res.clearCookie('connect.sid'); // Clear the session cookie just in case
        return res.status(200).json({ message: "Already logged out" });
      }
      return;
    }
    
    console.log(`Logout request for user: ${username}`);
    
    // Track the session logout
    sessionTracker.trackLogout(req.sessionID);
    
    try {
      // Use logout to remove user from the session
      req.logout((err) => {
        if (err) {
          console.error(`Logout error for user ${username}:`, err);
          // Even on error, try to destroy the session
          if (req.session) {
            req.session.destroy(() => {
              res.clearCookie('connect.sid');
              return res.status(200).json({ message: "Logged out with warnings" });
            });
          } else {
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: "Logged out with warnings" });
          }
          return;
        }
        
        // Fully destroy the session
        if (req.session) {
          req.session.destroy((sessionErr) => {
            if (sessionErr) {
              console.error(`Session destruction error for user ${username}:`, sessionErr);
              // Still return success as the user is effectively logged out
            }
            
            console.log(`User ${username} successfully logged out`);
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.status(200).json({ 
              message: "Logged out successfully",
              activeUsers: sessionTracker.getActiveCount()
            });
          });
        } else {
          console.log(`User ${username} logged out (no session to destroy)`);
          res.clearCookie('connect.sid'); // Clear the session cookie
          res.status(200).json({ 
            message: "Logged out successfully",
            activeUsers: sessionTracker.getActiveCount()
          });
        }
      });
    } catch (error) {
      console.error(`Unexpected logout error for user ${username}:`, error);
      // Try to clean up anyway
      if (req.session) {
        req.session.destroy(() => {});
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: "Logout completed with errors" });
    }
  });

  // Enhanced user info endpoint with multiple authentication methods for mobile compatibility
  app.get("/api/user", (req, res) => {
    console.log("User info request received");
    
    // Log diagnostic info for debugging
    const userAgent = req.headers['user-agent'] || 'unknown';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    console.log(`Request device type: ${isMobile ? 'mobile' : 'desktop'}, user agent: ${userAgent.substring(0, 50)}...`);
    
    // AUTHENTICATION METHOD 1: Standard passport session authentication
    if (req.isAuthenticated()) {
      console.log(`Returning passport-authenticated user: ${req.user.username} (ID: ${req.user.id})`);
      // Return user data without password
      const { password, ...userWithoutPassword } = req.user as SelectUser;
      return res.json(userWithoutPassword);
    }
    
    // AUTHENTICATION METHOD 2: Auth token from headers
    const authToken = req.headers['x-auth-token'] as string;
    
    // AUTHENTICATION METHOD 3: Token in URL query parameters 
    // (for browsers that don't support custom headers well)
    const queryToken = req.query.token as string;
    
    // AUTHENTICATION METHOD 4: Short token from URL parameters
    // (easier to use in mobile webviews)
    const shortToken = req.query.st as string;
    
    // AUTHENTICATION METHOD 5: Session ID as fallback
    const sessionIdParam = req.query.sid as string;
    
    // Log authentication attempts
    if (authToken) console.log("Auth token provided in header");
    if (queryToken) console.log("Token provided in query parameter");
    if (shortToken) console.log("Short token provided in query parameter");
    if (sessionIdParam) console.log("Session ID provided in query parameter");
    
    // TOKEN VALIDATION SECTION
    // Primary auth token check
    const primaryToken = authToken || queryToken;
    
    if (primaryToken && req.session) {
      // Check if the session has a stored auth token and userId
      if ((req.session as any).authToken === primaryToken) {
        const userId = (req.session as any).userId;
        if (userId) {
          console.log(`Primary token validation succeeded for user ID: ${userId}`);
          return getUserAndRespond(userId, req, res);
        }
      }
    }
    
    // Short token check
    if (shortToken && req.session) {
      // Check if the session has a stored short token and userId
      if ((req.session as any).shortToken === shortToken) {
        const userId = (req.session as any).userId;
        if (userId) {
          console.log(`Short token validation succeeded for user ID: ${userId}`);
          return getUserAndRespond(userId, req, res);
        }
      }
    }
    
    // Session ID check (most permissive, but still secured by secret)
    if (sessionIdParam && req.session) {
      if (sessionIdParam === req.sessionID) {
        const userId = (req.session as any).userId;
        if (userId) {
          console.log(`Session ID validation succeeded for user ID: ${userId}`);
          return getUserAndRespond(userId, req, res);
        }
      }
    }
    
    // USERNAME/DEVICE HISTORY VALIDATION (most permissive)
    // Only use for mobile devices as a last resort
    if (isMobile && req.session) {
      const sessionUsername = (req.session as any).username;
      const sessionDeviceType = (req.session as any).deviceType;
      const sessionUserAgent = (req.session as any).userAgent;
      
      // If we have a username in the session and device info matches
      if (sessionUsername && sessionDeviceType === 'mobile') {
        if (userAgent === sessionUserAgent) {
          console.log(`Device fingerprint validation succeeded for username: ${sessionUsername}`);
          
          // Get user ID from username (more secure than relying only on the session)
          storage.getUserByUsername(sessionUsername)
            .then(user => {
              if (user && user.id === (req.session as any).userId) {
                console.log(`Device history validation succeeded for user: ${user.username}`);
                return getUserAndRespond(user.id, req, res);
              } else {
                console.log("Device validation failed: User mismatch");
                return res.status(401).json({ message: "Authentication failed" });
              }
            })
            .catch(error => {
              console.error("Error in device validation:", error);
              return res.status(401).json({ message: "Authentication error" });
            });
          return;
        }
      }
    }
    
    // Helper function to get user and respond
    function getUserAndRespond(userId: number, req: any, res: any) {
      storage.getUser(userId)
        .then(user => {
          if (user) {
            console.log(`Returning authenticated user: ${user.username} (ID: ${user.id})`);
            
            // Rebuild the session by logging in the user
            req.login(user, (loginErr: Error) => {
              if (loginErr) {
                console.error("Session refresh error:", loginErr);
                // Continue anyway, since we're authenticating with token
              }
              
              // Return user data without password
              const { password, ...userWithoutPassword } = user;
              return res.json(userWithoutPassword);
            });
          } else {
            console.log(`Authentication failed: User ID ${userId} not found`);
            return res.status(401).json({ message: "User not found" });
          }
        })
        .catch(error => {
          console.error("Error retrieving user by ID:", error);
          return res.status(401).json({ message: "Authentication error" });
        });
    }
    
    // No valid authentication found
    console.log("User info request - not authenticated");
    return res.status(401).json({ message: "Not authenticated" });
  });

  // Request password reset
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Find user by email
      const users = await storage.getUsersByEmail(email);
      const user = users.length > 0 ? users[0] : null;
      
      if (!user) {
        // Don't reveal that email doesn't exist
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
      }

      // Generate reset token and set expiry (1 hour from now)
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth?token=${resetToken}`;

      // Send email
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || '"JET Program" <no-reply@jetprogram.example.com>',
        to: email,
        subject: "Password Reset - JET Program",
        text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
        `,
      });

      res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    } catch (error) {
      next(error);
    }
  });

  // Reset password
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);

      if (!user || !user.resetTokenExpiry) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if token is expired
      const now = new Date();
      if (now > user.resetTokenExpiry) {
        return res.status(400).json({ message: "Token has expired" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Admin middleware
  const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && req.user.isInstructor) {
      return next();
    }
    res.status(403).json({ message: "Not authorized - admin access required" });
  };

  // Protected routes helpers
  return { ensureAuthenticated, ensureAdmin };
}