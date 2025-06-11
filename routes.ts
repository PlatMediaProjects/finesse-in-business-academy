import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChapterSchema, 
  insertQuizQuestionSchema,
  insertStudentDraftSchema,
  insertTutorFeedbackSchema,
  insertMessageSchema
} from "@shared/schema";

// Import course data and auth setup
import { courseData } from "./courseData";
import { setupAuth, hashPassword } from "./auth";
import { sessionTracker } from "./services/sessionTracker";
import { registerNotificationRoutes } from "./routes/notificationRoutes";
import franchiseAdRoutes from "./routes/franchiseAdRoutes";
import adInteractionRoutes from "./routes/adInteractionRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import userInterestsRoutes from "./routes/userInterestsRoutes";
import enrollmentCodeRoutes from "./routes/enrollmentCodeRoutes";
import adminWorkspaceRoutes from "./routes/adminWorkspaceRoutes";
import videoContentRoutes from "./routes/videoContentRoutes";
import landingPageRoutes from "./routes/landingPageRoutes";
import coachRoutes from "./routes/coachRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  const { ensureAuthenticated, ensureAdmin } = setupAuth(app);
  
  // Important: Register landing page route FIRST with explicit path to override Vite/React routing
  // This will serve a static HTML file for the landing page
  app.get('/', (req, res) => {
    console.log(`[DirectRoot] Request received for / path - immediate redirect to landing page`);
    
    // Create a modern, professional HTML page
    const inlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
      <meta http-equiv="Pragma" content="no-cache">
      <meta http-equiv="Expires" content="0">
      <title>Finesse In Business Academy - JET Program</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
      <style>
        /* Reset and base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body, html { 
          font-family: 'Poppins', sans-serif;
          height: 100%;
          width: 100%;
          color: #333;
          background: #f5f7fa;
          overflow-x: hidden;
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #0c2d6b 0%, #154093 100%);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .brand-star {
          color: #ffd700;
          margin: 0 0.25rem;
        }
        .logo-container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        .logo {
          max-width: 100%;
          height: auto;
          margin-bottom: 1rem;
        }
        
        /* Hero section */
        .hero {
          background: linear-gradient(135deg, #0c2d6b 0%, #154093 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .hero-subtitle {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .hero-description {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }
        .hero-tagline {
          font-size: 1.1rem;
          font-style: italic;
          margin-bottom: 2rem;
          border-top: 1px solid rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding: 10px 0;
          max-width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Features grid */
        .features {
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          padding: 2rem;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #edf2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .feature-icon i {
          font-size: 1.5rem;
          color: #154093;
        }
        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #154093;
        }
        .feature-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #666;
        }
        
        /* CTA section */
        .cta {
          background: #f0f5ff;
          padding: 4rem 2rem;
          text-align: center;
        }
        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #154093;
        }
        .btn-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 400px;
          margin: 2rem auto;
        }
        .btn {
          display: block;
          padding: 1rem 2rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #154093 0%, #1a5bda 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1a5bda 0%, #176afa 100%);
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
        .btn-secondary {
          background: white;
          color: #154093;
          border: 2px solid #154093;
        }
        .btn-secondary:hover {
          background: #f0f5ff;
          transform: translateY(-3px);
        }
        
        /* Footer */
        .footer {
          background: #0c2d6b;
          color: white;
          padding: 2rem;
          text-align: center;
          font-size: 0.9rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          .hero-subtitle {
            font-size: 1.3rem;
          }
          .features {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="brand">
          <img src="/images/logo.png" alt="Finesse In Business Academy Logo" class="header-logo" style="height: 40px; margin-right: 10px;"> 
          Finesse In Business Academy
        </div>
      </header>
      
      <section class="hero">
        <div class="logo-container">
          <img src="/images/logo.png" alt="Finesse In Business Academy Logo" class="logo">
        </div>
        <h1 class="hero-title">JET Program</h1>
        <h2 class="hero-subtitle">Junior Executive Trainee Program</h2>
        <p class="hero-description">Transform your entrepreneurial vision into reality</p>
        <p class="hero-tagline"><strong>An exclusive service of First One Consultants, Inc.</strong></p>
        
        <div class="btn-container">
          <a href="/auth" class="btn btn-primary">Login / Register</a>
        </div>
      </section>
      
      <section class="features">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="bi bi-book"></i>
          </div>
          <h3 class="feature-title">Comprehensive Training</h3>
          <p class="feature-text">
            Access structured learning paths with chapter-based content designed to build your entrepreneurial skills from the ground up.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="bi bi-people"></i>
          </div>
          <h3 class="feature-title">Expert Coaching</h3>
          <p class="feature-text">
            Connect with experienced business coaches who provide personalized feedback and guidance throughout your entrepreneurial journey.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="bi bi-award"></i>
          </div>
          <h3 class="feature-title">Certification Path</h3>
          <p class="feature-text">
            Complete quizzes and assignments to earn your official JET Program certification, validating your expertise and business acumen.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="bi bi-building"></i>
          </div>
          <h3 class="feature-title">Franchise Opportunities</h3>
          <p class="feature-text">
            Discover exclusive franchise opportunities available to JET Program graduates, with guidance on evaluating and selecting the right business model.
          </p>
        </div>
      </section>
      
      <section class="cta">
        <h2 class="cta-title">Ready to Start Your Entrepreneurial Journey?</h2>
        <div class="btn-container">
          <a href="/auth" class="btn btn-primary">Login / Register</a>
        </div>
      </section>
      
      <footer class="footer">
        <p>© 2025 Finesse In Business Academy. All rights reserved. | <a href="/privacy-policy" style="color: white; text-decoration: underline;">Privacy Policy</a></p>
      </footer>
      
      <script>
        // Force reload to clear cache issues
        window.onload = function() {
          console.log('Page loaded - Version 2.0.0');
          
          // Clear local storage to avoid caching issues
          localStorage.clear();
          
          // Make sure all links use full URLs and bypass caching
          const timestamp = new Date().getTime();
          document.querySelectorAll('a').forEach(link => {
            if (!link.href.includes('?')) {
              link.href = link.href + '?v=' + timestamp;
            }
          });
        };
      </script>
    </body>
    </html>
    `;
    
    return res.status(200).send(inlineHtml);
  });
  
  // Also register the router for other paths
  app.use(landingPageRoutes);
  
  // Register notification routes
  registerNotificationRoutes(app);
  
  // Register franchise ad routes
  app.use("/api/franchise-ads", franchiseAdRoutes);
  app.use("/api/ad-interactions", adInteractionRoutes);
  
  // Register session tracking routes
  app.use("/api/sessions", sessionRoutes);
  
  // Register user interests and recommendation routes
  app.use("/api/user-interests", userInterestsRoutes);
  
  // Register enrollment code routes
  app.use("/api/enrollment-codes", enrollmentCodeRoutes);
  
  // Register admin workspace routes
  app.use("/api/admin", adminWorkspaceRoutes);
  
  // Register coach/instructor routes
  app.use("/api/coach", coachRoutes);
  
  // Register video content routes
  app.use(videoContentRoutes);
  
  // API routes for chapters
  app.get("/api/chapters", async (req, res) => {
    const chapters = await storage.getChapters();
    res.json(chapters);
  });

  app.get("/api/chapters/:id", async (req, res) => {
    const chapterId = parseInt(req.params.id);
    if (isNaN(chapterId)) {
      return res.status(400).json({ error: "Invalid chapter ID" });
    }
    
    const chapter = await storage.getChapter(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    
    res.json(chapter);
  });
  
  // Debug route for chapters that doesn't require auth
  app.get("/api/debug/chapters/:id", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      if (isNaN(chapterId)) {
        return res.status(400).json({ error: "Invalid chapter ID" });
      }
      
      const chapter = await storage.getChapter(chapterId);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      
      // Log the structure of the chapter for debugging
      console.log('DEBUG - Chapter ID:', chapterId);
      console.log('DEBUG - Chapter structure:', JSON.stringify(chapter, null, 2).substring(0, 200) + '...');
      
      res.json({
        id: chapter.id,
        title: chapter.title,
        number: chapter.number,
        description: chapter.description,
        contentKeys: chapter.content ? Object.keys(chapter.content) : [],
        hasContent: !!chapter.content,
        sectionsCount: chapter.content && chapter.content.sections ? chapter.content.sections.length : 0
      });
    } catch (error) {
      console.error('Error in debug chapter route:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  // API routes for quiz questions - protected
  app.get("/api/chapters/:chapterId/quiz", ensureAuthenticated, async (req, res) => {
    const chapterId = parseInt(req.params.chapterId);
    if (isNaN(chapterId)) {
      return res.status(400).json({ error: "Invalid chapter ID" });
    }
    
    const questions = await storage.getQuizQuestions(chapterId);
    res.json(questions);
  });

  // API routes for progress tracking - protected
  app.get("/api/progress", ensureAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    
    const progress = await storage.getUserProgress(userId);
    
    // If no progress records exist, create initial ones
    if (!progress || progress.length === 0) {
      const chapters = await storage.getChapters();
      const initialProgress = [];
      
      for (const chapter of chapters) {
        initialProgress.push(await storage.updateProgress({
          userId,
          chapterId: chapter.id,
          isCompleted: false,
          lastAccessed: chapter.id === 1 ? new Date() : null
        }));
      }
      
      res.json(initialProgress);
    } else {
      res.json(progress);
    }
  });
  
  // Initialize progress for a user (mainly for testing)
  app.post("/api/progress/initialize", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const chapters = await storage.getChapters();
      
      for (const user of users) {
        // Clear existing progress
        await storage.clearUserProgress(user.id);
        
        // Create initial progress for each chapter
        for (const chapter of chapters) {
          await storage.updateProgress({
            userId: user.id,
            chapterId: chapter.id,
            isCompleted: false,
            lastAccessed: chapter.id === 1 ? new Date() : null
          });
        }
      }
      
      res.json({ message: "Progress initialized for all users" });
    } catch (error) {
      console.error("Error initializing progress:", error);
      res.status(500).json({ error: "Failed to initialize progress" });
    }
  });

  app.post("/api/progress", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "User not authenticated" });
      }
      
      const progressData = {
        ...req.body,
        userId
      };
      
      const progress = await storage.updateProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // API routes for quiz attempts - protected
  app.get("/api/quiz-attempts/:chapterId", ensureAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    const chapterId = parseInt(req.params.chapterId);
    
    if (!userId || isNaN(chapterId)) {
      return res.status(400).json({ error: "Invalid user ID or chapter ID" });
    }
    
    const attempts = await storage.getQuizAttempts(userId, chapterId);
    res.json(attempts);
  });

  app.post("/api/quiz-attempts", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "User not authenticated" });
      }
      
      const attemptData = {
        ...req.body,
        userId
      };
      
      const attempt = await storage.createQuizAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ error: "Invalid attempt data" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Filter out sensitive information like passwords
      const sanitizedUsers = users.map(user => {
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        return userInfo;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/progress", ensureAdmin, async (req, res) => {
    try {
      // Get all users
      const users = await storage.getAllUsers();
      
      // Get progress for all users
      const allProgress = [];
      for (const user of users) {
        const userProgress = await storage.getUserProgress(user.id);
        allProgress.push(...userProgress);
      }
      
      res.json(allProgress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress data" });
    }
  });

  app.get("/api/admin/quiz-attempts", ensureAdmin, async (req, res) => {
    try {
      // Get all users
      const users = await storage.getAllUsers();
      
      // Get quiz attempts for all users and all chapters
      const allAttempts = [];
      for (const user of users) {
        const chapters = await storage.getChapters();
        for (const chapter of chapters) {
          const attempts = await storage.getQuizAttempts(user.id, chapter.id);
          allAttempts.push(...attempts);
        }
      }
      
      res.json(allAttempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempt data" });
    }
  });

  // Admin user management
  app.post("/api/admin/create-instructor", ensureAdmin, async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create new instructor user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        isInstructor: true, // Set as instructor
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({ message: "Failed to create instructor account" });
    }
  });

  // Admin setup route - only for initial setup and development
  app.post("/api/setup/make-instructor", async (req, res) => {
    try {
      const { username, secretKey } = req.body;
      
      // Simple security check using a secret key
      if (secretKey !== process.env.ADMIN_SETUP_KEY && secretKey !== "jet-program-setup-2025") {
        return res.status(403).json({ message: "Invalid setup key" });
      }
      
      // Import from admin-setup.ts to avoid circular dependency
      const { makeUserInstructor } = await import("./admin-setup");
      const success = await makeUserInstructor(username);
      
      if (success) {
        res.status(200).json({ message: `User ${username} is now an instructor` });
      } else {
        res.status(404).json({ message: `User ${username} not found` });
      }
    } catch (error) {
      console.error("Error in admin setup:", error);
      res.status(500).json({ message: "Server error during admin setup" });
    }
  });
  
  // Direct admin access with passcode
  app.post("/api/admin/passcode-auth", async (req, res) => {
    try {
      const { username, passcode } = req.body;
      console.log(`Admin passcode auth attempt for username: ${username}`);
      
      // Verify the passcode for CreativeOne
      const ADMIN_PASSCODE = "admin123";
      
      if (username !== "CreativeOne" || passcode !== ADMIN_PASSCODE) {
        console.log("Invalid admin passcode attempt");
        return res.status(401).json({ message: "Invalid username or passcode" });
      }
      
      console.log("Admin passcode verified successfully");
      
      // Check if user already exists
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Create the user with the passcode as password
        user = await storage.createUser({
          username,
          email: "admin@finesseacademy.com",
          password: await hashPassword(ADMIN_PASSCODE),
          studentId: "ADMIN001", // Special admin student ID
          isInstructor: true, // Make them an instructor by default
          isFounder: true, // Set founder status for CreativeOne
        });
        
        console.log(`Created admin user ${username} with passcode authentication`);
      } else if (!user.isInstructor) {
        // If user exists but is not an instructor, make them one
        const { makeUserInstructor } = await import("./admin-setup");
        await makeUserInstructor(username);
        
        // Refresh user data
        user = await storage.getUserByUsername(username);
      }
      
      // Make sure we have a valid user before proceeding
      if (!user) {
        return res.status(500).json({ message: "Failed to create or retrieve user" });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login error with passcode auth:", err);
          return res.status(500).json({ message: "Authentication error" });
        }
        
        // Generate JWT token or similar auth token
        const authToken = `admin_passcode_auth_${Date.now()}`;
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        // Track the session in our session tracking service
        try {
          sessionTracker.addSession({
            userId: user.id,
            username: user.username,
            token: authToken,
            type: 'direct-admin',
            expiry: new Date(tokenExpiry)
          });
          console.log(`Admin session created for ${user.username}`);
        } catch (sessionError) {
          console.error("Session tracking error:", sessionError);
          // Continue anyway, not critical
        }
        
        // Return user data without sensitive information but with auth token
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        
        // Add auth token to response
        const responseData = {
          ...userInfo,
          authToken,
          tokenExpiry
        };
        
        // Set token in header as well for redundancy
        res.setHeader('X-Auth-Token', authToken);
        res.status(200).json(responseData);
      });
    } catch (error) {
      console.error("Error in passcode authentication:", error);
      res.status(500).json({ message: "Server error during authentication" });
    }
  });

  // Tutor Management
  app.get("/api/tutors", async (req, res) => {
    try {
      const tutors = await storage.getTutors();
      // Remove sensitive information
      const sanitizedTutors = tutors.map(tutor => {
        const { password, resetToken, resetTokenExpiry, ...tutorInfo } = tutor;
        return tutorInfo;
      });
      res.json(sanitizedTutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  // Admin endpoint to manage user roles
  app.post("/api/admin/update-user-role", ensureAdmin, async (req, res) => {
    try {
      const { userId, isTutor, isInstructor } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.updateUserRole(
        Number(userId), 
        !!isTutor, 
        !!isInstructor
      );
      
      // Remove sensitive information
      const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Student workspace
  app.get("/api/drafts", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const drafts = await storage.getStudentDrafts(userId);
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      res.status(500).json({ message: "Failed to fetch drafts" });
    }
  });

  app.get("/api/drafts/:id", ensureAuthenticated, async (req, res) => {
    try {
      const draftId = parseInt(req.params.id);
      if (isNaN(draftId)) {
        return res.status(400).json({ message: "Invalid draft ID" });
      }
      
      const draft = await storage.getStudentDraft(draftId);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Ensure user has access to this draft
      if (draft.userId !== req.user?.id && !req.user?.isTutor && !req.user?.isInstructor) {
        return res.status(403).json({ message: "Not authorized to access this draft" });
      }
      
      res.json(draft);
    } catch (error) {
      console.error("Error fetching draft:", error);
      res.status(500).json({ message: "Failed to fetch draft" });
    }
  });

  app.get("/api/drafts/chapter/:chapterId", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const chapterId = parseInt(req.params.chapterId);
      if (!userId || isNaN(chapterId)) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }
      
      const drafts = await storage.getDraftsByChapter(userId, chapterId);
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching chapter drafts:", error);
      res.status(500).json({ message: "Failed to fetch chapter drafts" });
    }
  });

  app.post("/api/drafts", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const draftData = {
        ...req.body,
        userId
      };
      
      const draft = await storage.createDraft(insertStudentDraftSchema.parse(draftData));
      res.status(201).json(draft);
    } catch (error) {
      console.error("Error creating draft:", error);
      res.status(400).json({ message: "Failed to create draft" });
    }
  });

  app.put("/api/drafts/:id", ensureAuthenticated, async (req, res) => {
    try {
      const draftId = parseInt(req.params.id);
      if (isNaN(draftId)) {
        return res.status(400).json({ message: "Invalid draft ID" });
      }
      
      const draft = await storage.getStudentDraft(draftId);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Check if user owns this draft
      if (draft.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to update this draft" });
      }
      
      const { content, status } = req.body;
      const updatedDraft = await storage.updateDraft(draftId, content, status);
      res.json(updatedDraft);
    } catch (error) {
      console.error("Error updating draft:", error);
      res.status(500).json({ message: "Failed to update draft" });
    }
  });

  // Tutor feedback
  app.get("/api/feedback/:draftId", ensureAuthenticated, async (req, res) => {
    try {
      const draftId = parseInt(req.params.draftId);
      if (isNaN(draftId)) {
        return res.status(400).json({ message: "Invalid draft ID" });
      }
      
      // Get the draft to check permissions
      const draft = await storage.getStudentDraft(draftId);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Check if user has permission to view this feedback
      if (draft.userId !== req.user?.id && !req.user?.isTutor && !req.user?.isInstructor) {
        return res.status(403).json({ message: "Not authorized to access this feedback" });
      }
      
      const feedback = await storage.getTutorFeedback(draftId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", ensureAuthenticated, async (req, res) => {
    try {
      // Only tutors can create feedback
      if (!req.user?.isTutor && !req.user?.isInstructor) {
        return res.status(403).json({ message: "Only tutors can provide feedback" });
      }
      
      const feedbackData = {
        ...req.body,
        tutorId: req.user.id
      };
      
      const feedback = await storage.createTutorFeedback(insertTutorFeedbackSchema.parse(feedbackData));
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Failed to create feedback" });
    }
  });

  // Messaging system
  app.get("/api/messages/inbox", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messages = await storage.getInboxMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
      res.status(500).json({ message: "Failed to fetch inbox messages" });
    }
  });

  app.get("/api/messages/sent", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messages = await storage.getSentMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching sent messages:", error);
      res.status(500).json({ message: "Failed to fetch sent messages" });
    }
  });

  app.get("/api/messages/:id", ensureAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if user has permission to view this message
      if (message.senderId !== req.user?.id && message.recipientId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to access this message" });
      }
      
      // Mark as read if recipient is viewing
      if (message.recipientId === req.user?.id && !message.isRead) {
        await storage.markMessageAsRead(messageId);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  app.post("/api/messages", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageData = {
        ...req.body,
        senderId: userId
      };
      
      // Validate recipient exists
      const recipient = await storage.getUser(messageData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Create message
      const message = await storage.createMessage(insertMessageSchema.parse(messageData));
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", ensureAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only recipient can mark as read
      if (message.recipientId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  // Initialize course data if needed
  await initializeCourseData();

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeCourseData() {
  // Check if chapters already exist
  const existingChapters = await storage.getChapters();
  if (existingChapters.length === 0) {
    console.log("Initializing course data...");
    
    // Create chapters
    for (const chapterData of courseData.chapters) {
      const parsedChapter = insertChapterSchema.parse(chapterData);
      await storage.createChapter(parsedChapter);
    }
    
    // Create quiz questions for each chapter
    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapterData = courseData.chapters[i];
      const chapterId = i + 1; // Chapter IDs start from 1
      
      if (chapterData.quiz && Array.isArray(chapterData.quiz)) {
        for (const questionData of chapterData.quiz) {
          const questionToInsert = {
            ...questionData,
            chapterId
          };
          
          const parsedQuestion = insertQuizQuestionSchema.parse(questionToInsert);
          await storage.createQuizQuestion(parsedQuestion);
        }
      }
    }
    
    console.log("Course data initialized successfully");
  }
}