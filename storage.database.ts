import {
  users, type User, type InsertUser,
  chapters, type Chapter, type InsertChapter,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  userProgress, type UserProgress, type InsertUserProgress,
  quizAttempts, type QuizAttempt, type InsertQuizAttempt,
  studentDrafts, type StudentDraft, type InsertStudentDraft,
  tutorFeedback, type TutorFeedback, type InsertTutorFeedback,
  messages, type Message, type InsertMessage,
  notifications, type Notification, type InsertNotification,
  notificationTemplates, type NotificationTemplate, type InsertNotificationTemplate,
  franchiseAds, type FranchiseAd, type InsertFranchiseAd,
  adInteractions, type AdInteraction, type InsertAdInteraction,
  userInterests, type UserInterests, type InsertUserInterests,
  enrollmentCodes, type EnrollmentCode, type InsertEnrollmentCode,
  videoContent, type VideoContent, type InsertVideoContent,
  videoViews, type VideoView, type InsertVideoView
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, isNotNull, sql } from "drizzle-orm";
import { IStorage } from "./storage";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PgSessionStore = connectPgSimple(session);
    this.sessionStore = new PgSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length ? results[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results.length ? results[0] : undefined;
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.email, email));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const results = await db.select().from(users)
      .where(and(
        eq(users.resetToken, token),
        isNotNull(users.resetTokenExpiry)
      ));
    return results.length ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      isInstructor: insertUser.isInstructor ?? false
    }).returning();
    return result[0];
  }
  
  async updateUserResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await db.update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry
      })
      .where(eq(users.id, userId));
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, userId));
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async clearUserProgress(userId: number): Promise<void> {
    await db.delete(userProgress)
      .where(eq(userProgress.userId, userId));
  }
  
  // Chapter methods
  async getChapters(): Promise<Chapter[]> {
    const results = await db.select().from(chapters).orderBy(chapters.number);
    return results;
  }
  
  async getChapter(id: number): Promise<Chapter | undefined> {
    const results = await db.select().from(chapters).where(eq(chapters.id, id));
    return results.length ? results[0] : undefined;
  }
  
  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const result = await db.insert(chapters).values(insertChapter).returning();
    return result[0];
  }
  
  // Quiz methods
  async getQuizQuestions(chapterId: number): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).where(eq(quizQuestions.chapterId, chapterId));
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    const results = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));
    return results.length ? results[0] : undefined;
  }
  
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const result = await db.insert(quizQuestions).values({
      ...insertQuestion,
      explanation: insertQuestion.explanation || null
    }).returning();
    return result[0];
  }
  
  // Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  
  async getAllProgress(): Promise<UserProgress[]> {
    return await db.select().from(userProgress);
  }
  
  async getChapterProgress(userId: number, chapterId: number): Promise<UserProgress | undefined> {
    const results = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.chapterId, chapterId)
      )
    );
    return results.length ? results[0] : undefined;
  }
  
  async updateProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists
    const existingProgress = await this.getChapterProgress(
      insertProgress.userId,
      insertProgress.chapterId
    );
    
    if (existingProgress) {
      // Update existing progress
      const result = await db.update(userProgress)
        .set({
          isCompleted: insertProgress.isCompleted ?? existingProgress.isCompleted,
          quizScore: insertProgress.quizScore ?? existingProgress.quizScore,
          lastAccessed: insertProgress.lastAccessed ?? new Date()
        })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      
      return result[0];
    } else {
      // Create new progress entry
      const result = await db.insert(userProgress).values({
        ...insertProgress,
        isCompleted: insertProgress.isCompleted ?? false,
        lastAccessed: insertProgress.lastAccessed ?? new Date()
      }).returning();
      
      return result[0];
    }
  }
  
  // Quiz attempts
  async getQuizAttempts(userId: number, chapterId: number): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.chapterId, chapterId)
        )
      )
      .orderBy(quizAttempts.completedAt);
  }
  
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const result = await db.insert(quizAttempts).values({
      ...insertAttempt,
      completedAt: insertAttempt.completedAt ?? new Date()
    }).returning();
    
    return result[0];
  }

  // Tutor methods
  async getTutors(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isTutor, true));
  }

  async updateUserRole(userId: number, isTutor: boolean, isInstructor: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isTutor, isInstructor })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Student workspace methods
  async getStudentDrafts(userId: number): Promise<StudentDraft[]> {
    return await db
      .select()
      .from(studentDrafts)
      .where(eq(studentDrafts.userId, userId))
      .orderBy(studentDrafts.lastUpdated);
  }
  
  async getAllStudentDrafts(): Promise<StudentDraft[]> {
    return await db
      .select()
      .from(studentDrafts)
      .orderBy(sql`${studentDrafts.lastUpdated} DESC`);
  }

  async getStudentDraft(id: number): Promise<StudentDraft | undefined> {
    const results = await db
      .select()
      .from(studentDrafts)
      .where(eq(studentDrafts.id, id));
    return results.length ? results[0] : undefined;
  }

  async getDraftsByChapter(userId: number, chapterId: number): Promise<StudentDraft[]> {
    return await db
      .select()
      .from(studentDrafts)
      .where(and(
        eq(studentDrafts.userId, userId),
        eq(studentDrafts.chapterId, chapterId)
      ))
      .orderBy(studentDrafts.lastUpdated);
  }

  async createDraft(draft: InsertStudentDraft): Promise<StudentDraft> {
    const [newDraft] = await db
      .insert(studentDrafts)
      .values(draft)
      .returning();
    return newDraft;
  }

  async updateDraft(id: number, content: any, status: string): Promise<StudentDraft> {
    const [updatedDraft] = await db
      .update(studentDrafts)
      .set({ 
        content, 
        status, 
        lastUpdated: new Date() 
      })
      .where(eq(studentDrafts.id, id))
      .returning();
    return updatedDraft;
  }

  // Tutor feedback methods
  async getTutorFeedback(draftId: number): Promise<TutorFeedback[]> {
    return await db
      .select()
      .from(tutorFeedback)
      .where(eq(tutorFeedback.draftId, draftId))
      .orderBy(tutorFeedback.createdAt);
  }

  async createTutorFeedback(feedback: InsertTutorFeedback): Promise<TutorFeedback> {
    const [newFeedback] = await db
      .insert(tutorFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  // Messaging methods
  async getInboxMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(messages.sentAt);
  }

  async getSentMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
      .orderBy(messages.sentAt);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const results = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return results.length ? results[0] : undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Notification methods
  async updateUserNotificationPreferences(
    userId: number, 
    emailNotifications: boolean, 
    smsNotifications: boolean, 
    pushNotifications: boolean, 
    phone?: string
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        emailNotifications, 
        smsNotifications, 
        pushNotifications, 
        phone: phone || null 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    if (userId === 0) {
      // Special case: get all unread notifications for all users
      return db
        .select()
        .from(notifications)
        .where(eq(notifications.isRead, false))
        .orderBy(notifications.createdAt);
    }
    
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(notifications.createdAt);
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return results.length ? results[0] : undefined;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return createdNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async bulkCreateNotifications(
    userIds: number[], 
    notification: Omit<InsertNotification, 'userId'>
  ): Promise<number> {
    const notificationsToInsert = userIds.map(userId => ({
      ...notification,
      userId
    }));
    
    const result = await db
      .insert(notifications)
      .values(notificationsToInsert)
      .returning();
      
    return result.length;
  }

  async markNotificationDelivered(id: number, method: 'email' | 'sms' | 'push'): Promise<Notification> {
    const updateData: Partial<Notification> = {};
    
    if (method === 'email') {
      updateData.sentViaEmail = true;
    } else if (method === 'sms') {
      updateData.sentViaSMS = true;
    } else if (method === 'push') {
      updateData.sentViaPush = true;
    }
    
    const [updatedNotification] = await db
      .update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id))
      .returning();
      
    return updatedNotification;
  }

  async getPendingScheduledNotifications(beforeDate: Date): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.isRead, false),
        isNotNull(notifications.scheduledFor),
        sql`${notifications.scheduledFor} <= ${beforeDate}`
      ));
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return db
      .select()
      .from(notificationTemplates)
      .orderBy(notificationTemplates.createdAt);
  }

  async getNotificationTemplate(id: number): Promise<NotificationTemplate | undefined> {
    const results = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id));
    return results.length ? results[0] : undefined;
  }

  async getNotificationTemplateByType(type: string): Promise<NotificationTemplate | undefined> {
    const results = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.type, type),
        eq(notificationTemplates.isActive, true)
      ))
      .orderBy(notificationTemplates.updatedAt);
    
    // Return the most recently updated template of this type
    return results.length ? results[0] : undefined;
  }

  async createNotificationTemplate(template: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [createdTemplate] = await db
      .insert(notificationTemplates)
      .values(template)
      .returning();
    return createdTemplate;
  }

  async updateNotificationTemplate(
    id: number, 
    template: Partial<InsertNotificationTemplate>
  ): Promise<NotificationTemplate> {
    const [updatedTemplate] = await db
      .update(notificationTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async toggleNotificationTemplateStatus(id: number, isActive: boolean): Promise<NotificationTemplate> {
    const [updatedTemplate] = await db
      .update(notificationTemplates)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  // Franchise Advertisement System methods
  async getFranchiseAds(): Promise<FranchiseAd[]> {
    return db
      .select()
      .from(franchiseAds)
      .orderBy(franchiseAds.priority);
  }

  async getFranchiseAd(id: number): Promise<FranchiseAd | undefined> {
    const results = await db
      .select()
      .from(franchiseAds)
      .where(eq(franchiseAds.id, id));
    return results.length ? results[0] : undefined;
  }

  async getActiveFranchiseAds(): Promise<FranchiseAd[]> {
    const now = new Date();
    return db
      .select()
      .from(franchiseAds)
      .where(and(
        eq(franchiseAds.isActive, true),
        sql`${franchiseAds.startDate} <= ${now}`,
        sql`(${franchiseAds.endDate} IS NULL OR ${franchiseAds.endDate} >= ${now})`
      ))
      .orderBy(franchiseAds.priority);
  }

  async getFranchiseAdsByChapter(chapterId: number): Promise<FranchiseAd[]> {
    const now = new Date();
    const chapterIdStr = String(chapterId);
    
    return db
      .select()
      .from(franchiseAds)
      .where(and(
        eq(franchiseAds.isActive, true),
        sql`${franchiseAds.startDate} <= ${now}`,
        sql`(${franchiseAds.endDate} IS NULL OR ${franchiseAds.endDate} >= ${now})`,
        sql`(${franchiseAds.displayLocation} = 'all' OR ${franchiseAds.displayLocation} = 'chapter')`,
        sql`(${franchiseAds.chapterIds} IS NULL OR ${franchiseAds.chapterIds} LIKE '%${chapterIdStr}%')`
      ))
      .orderBy(franchiseAds.priority);
  }

  async createFranchiseAd(ad: InsertFranchiseAd): Promise<FranchiseAd> {
    const [newAd] = await db
      .insert(franchiseAds)
      .values(ad)
      .returning();
    return newAd;
  }

  async updateFranchiseAd(id: number, ad: Partial<InsertFranchiseAd>): Promise<FranchiseAd> {
    const [updatedAd] = await db
      .update(franchiseAds)
      .set(ad)
      .where(eq(franchiseAds.id, id))
      .returning();
    return updatedAd;
  }

  async toggleFranchiseAdStatus(id: number, isActive: boolean): Promise<FranchiseAd> {
    const [updatedAd] = await db
      .update(franchiseAds)
      .set({ isActive })
      .where(eq(franchiseAds.id, id))
      .returning();
    return updatedAd;
  }

  async deleteFranchiseAd(id: number): Promise<void> {
    await db
      .delete(franchiseAds)
      .where(eq(franchiseAds.id, id));
  }

  // Ad Interaction methods
  async getAdInteractions(adId: number): Promise<AdInteraction[]> {
    return db
      .select()
      .from(adInteractions)
      .where(eq(adInteractions.adId, adId))
      .orderBy(adInteractions.createdAt);
  }

  async getUserAdInteractions(userId: number): Promise<AdInteraction[]> {
    return db
      .select()
      .from(adInteractions)
      .where(eq(adInteractions.userId, userId))
      .orderBy(adInteractions.createdAt);
  }

  async getAdInteractionByUserAndAd(userId: number, adId: number): Promise<AdInteraction | undefined> {
    const results = await db
      .select()
      .from(adInteractions)
      .where(and(
        eq(adInteractions.userId, userId),
        eq(adInteractions.adId, adId)
      ));
    return results.length ? results[0] : undefined;
  }

  async createAdInteraction(interaction: InsertAdInteraction): Promise<AdInteraction> {
    const [newInteraction] = await db
      .insert(adInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async updateAdInteraction(id: number, interaction: Partial<InsertAdInteraction>): Promise<AdInteraction> {
    const [updatedInteraction] = await db
      .update(adInteractions)
      .set(interaction)
      .where(eq(adInteractions.id, id))
      .returning();
    return updatedInteraction;
  }

  async trackAdView(userId: number, adId: number, viewDuration?: number): Promise<AdInteraction> {
    // Check if interaction exists
    const existingInteraction = await this.getAdInteractionByUserAndAd(userId, adId);
    
    if (existingInteraction) {
      // Update existing interaction
      return this.updateAdInteraction(existingInteraction.id, {
        viewed: true,
        viewedAt: new Date(),
        viewDuration: viewDuration || existingInteraction.viewDuration
      });
    } else {
      // Create new interaction
      return this.createAdInteraction({
        userId,
        adId,
        viewed: true,
        viewedAt: new Date(),
        viewDuration
      });
    }
  }

  async submitAdComment(userId: number, adId: number, comment: string, interested: boolean): Promise<AdInteraction> {
    // Check if interaction exists
    const existingInteraction = await this.getAdInteractionByUserAndAd(userId, adId);
    
    if (existingInteraction) {
      // Update existing interaction
      return this.updateAdInteraction(existingInteraction.id, {
        commented: true,
        comment,
        commentedAt: new Date(),
        interested
      });
    } else {
      // Create new interaction
      return this.createAdInteraction({
        userId,
        adId,
        commented: true,
        comment,
        commentedAt: new Date(),
        interested
      });
    }
  }

  async getAdStats(adId: number): Promise<{ views: number, comments: number, interested: number }> {
    const interactions = await this.getAdInteractions(adId);
    
    return {
      views: interactions.filter(i => i.viewed).length,
      comments: interactions.filter(i => i.commented).length,
      interested: interactions.filter(i => i.interested).length
    };
  }

  async getUserAdComplianceStatus(userId: number): Promise<{ requiredViews: number, completedViews: number, progress: number }> {
    // Get all active ads
    const activeAds = await this.getActiveFranchiseAds();
    const requiredViews = activeAds.length;
    
    // Get user interactions
    const userInteractions = await this.getUserAdInteractions(userId);
    
    // Count completed views (ads that were viewed and commented on)
    const completedViews = userInteractions.filter(interaction => 
      interaction.viewed && interaction.commented
    ).length;
    
    // Calculate progress percentage
    const progress = requiredViews > 0 
      ? Math.min(100, Math.round((completedViews / requiredViews) * 100)) 
      : 100;
    
    return {
      requiredViews,
      completedViews,
      progress
    };
  }

  // User Interests methods
  async getUserInterests(userId: number): Promise<UserInterests | undefined> {
    const results = await db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, userId));
    
    return results[0];
  }

  async createUserInterests(interests: InsertUserInterests): Promise<UserInterests> {
    const [result] = await db
      .insert(userInterests)
      .values({
        ...interests,
        updatedAt: new Date()
      })
      .returning();
    
    return result;
  }

  async updateUserInterests(userId: number, interests: Partial<InsertUserInterests>): Promise<UserInterests> {
    // Get existing interests first
    const existingInterests = await this.getUserInterests(userId);
    
    if (!existingInterests) {
      // If no existing interests, create new entry
      return this.createUserInterests({
        userId,
        ...interests,
      } as InsertUserInterests);
    }
    
    // Update existing interests
    const [result] = await db
      .update(userInterests)
      .set({
        ...interests,
        updatedAt: new Date()
      })
      .where(eq(userInterests.userId, userId))
      .returning();
    
    return result;
  }

  // Enrollment code methods
  async getEnrollmentCode(code: string): Promise<EnrollmentCode | undefined> {
    const results = await db
      .select()
      .from(enrollmentCodes)
      .where(eq(enrollmentCodes.code, code));
    
    return results[0];
  }

  async verifyEnrollmentCode(code: string): Promise<boolean> {
    const enrollmentCode = await this.getEnrollmentCode(code);
    if (!enrollmentCode) {
      return false;
    }
    
    // Check if the code is already used
    if (enrollmentCode.isUsed) {
      return false;
    }
    
    // Check if the code is expired
    if (enrollmentCode.expiresAt && enrollmentCode.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  }

  async markEnrollmentCodeUsed(code: string, userId: number): Promise<EnrollmentCode> {
    const [enrollmentCode] = await db
      .update(enrollmentCodes)
      .set({ isUsed: true, usedBy: userId, usedAt: new Date() })
      .where(eq(enrollmentCodes.code, code))
      .returning();
    
    if (!enrollmentCode) {
      throw new Error('Enrollment code not found');
    }
    
    return enrollmentCode;
  }

  async createEnrollmentCode(insertCode: InsertEnrollmentCode): Promise<EnrollmentCode> {
    const [enrollmentCode] = await db
      .insert(enrollmentCodes)
      .values(insertCode)
      .returning();
    
    return enrollmentCode;
  }

  async getAllEnrollmentCodes(): Promise<EnrollmentCode[]> {
    return await db
      .select()
      .from(enrollmentCodes)
      .orderBy(sql`${enrollmentCodes.createdAt} DESC`);
  }

  async getActiveEnrollmentCodes(): Promise<EnrollmentCode[]> {
    return await db
      .select()
      .from(enrollmentCodes)
      .where(eq(enrollmentCodes.isUsed, false))
      .orderBy(sql`${enrollmentCodes.createdAt} DESC`);
  }

  async getEnrollmentCodesByState(stateCode: string): Promise<EnrollmentCode[]> {
    return await db
      .select()
      .from(enrollmentCodes)
      .where(sql`LEFT(${enrollmentCodes.code}, 2) = ${stateCode}`)
      .orderBy(sql`${enrollmentCodes.createdAt} DESC`);
  }

  async toggleEnrollmentCodeUsed(id: number, isUsed: boolean): Promise<EnrollmentCode> {
    const updateValues: any = { isUsed };
    
    // If marking as unused, clear the used by information
    if (!isUsed) {
      updateValues.usedBy = null;
      updateValues.usedAt = null;
    }
    
    const [enrollmentCode] = await db
      .update(enrollmentCodes)
      .set(updateValues)
      .where(eq(enrollmentCodes.id, id))
      .returning();
    
    if (!enrollmentCode) {
      throw new Error('Enrollment code not found');
    }
    
    return enrollmentCode;
  }

  async validateEnrollmentCode(code: string): Promise<EnrollmentCode | undefined> {
    const results = await db
      .select()
      .from(enrollmentCodes)
      .where(and(
        eq(enrollmentCodes.code, code),
        eq(enrollmentCodes.isUsed, false)
      ));
    
    return results[0];
  }

  async deleteEnrollmentCode(id: number): Promise<void> {
    await db
      .delete(enrollmentCodes)
      .where(eq(enrollmentCodes.id, id));
  }

  async getRecommendedAds(userId: number, limit: number = 10): Promise<FranchiseAd[]> {
    // Get user interests
    const userPreferences = await this.getUserInterests(userId);
    
    // If no user preferences, just return active ads
    if (!userPreferences) {
      const activeAds = await this.getActiveFranchiseAds();
      return activeAds.slice(0, limit);
    }
    
    // Get all active ads
    const allAds = await this.getActiveFranchiseAds();
    
    if (allAds.length === 0) {
      return [];
    }

    // User preferences as arrays
    const userInterests = userPreferences.interests ? userPreferences.interests.split(',').map(i => i.trim().toLowerCase()) : [];
    const userFood = userPreferences.foodPreferences ? userPreferences.foodPreferences.split(',').map(i => i.trim().toLowerCase()) : [];
    const userHobbies = userPreferences.hobbyPreferences ? userPreferences.hobbyPreferences.split(',').map(i => i.trim().toLowerCase()) : [];
    const userBusiness = userPreferences.businessInterests ? userPreferences.businessInterests.split(',').map(i => i.trim().toLowerCase()) : [];
    
    // All user preferences combined
    const allUserPreferences = [...userInterests, ...userFood, ...userHobbies, ...userBusiness];
    
    // Score and categorize ads based on matching
    const scoredAds = allAds.map(ad => {
      // Convert ad tags to arrays
      const adInterests = ad.interestTags ? ad.interestTags.split(',').map(i => i.trim().toLowerCase()) : [];
      const adCategories = ad.categoryTags ? ad.categoryTags.split(',').map(i => i.trim().toLowerCase()) : [];
      const adComplementary = ad.complementaryTags ? ad.complementaryTags.split(',').map(i => i.trim().toLowerCase()) : [];

      // Calculate primary match score (direct interest match)
      const primaryMatches = adInterests.filter(tag => allUserPreferences.includes(tag)).length +
                            adCategories.filter(tag => userBusiness.includes(tag)).length;
                            
      // Calculate complementary match score
      const complementaryMatches = adComplementary.filter(tag => allUserPreferences.includes(tag)).length;
      
      // Calculate total score based on weights
      const weightedScore = 
        (primaryMatches > 0 ? userPreferences.primaryMatchWeight : 0) + 
        (complementaryMatches > 0 ? userPreferences.complementaryMatchWeight : 0);
      
      // Determine category
      let category = 'discovery'; // Default category
      
      if (primaryMatches > 0) {
        category = 'primary';
      } else if (complementaryMatches > 0) {
        category = 'complementary';
      }
      
      return {
        ad,
        score: weightedScore,
        category
      };
    });
    
    // Sort by the configured weights (and secondarily by priority)
    scoredAds.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
      // If scores are tied, sort by ad priority
      return b.ad.priority - a.ad.priority;
    });
    
    // Calculate how many ads to take from each category
    const primaryCount = Math.ceil(limit * (userPreferences.primaryMatchWeight / 100));
    const complementaryCount = Math.ceil(limit * (userPreferences.complementaryMatchWeight / 100));
    const discoveryCount = Math.ceil(limit * (userPreferences.discoveryWeight / 100));
    
    // Get primary matches
    const primaryAds = scoredAds
      .filter(item => item.category === 'primary')
      .slice(0, primaryCount)
      .map(item => item.ad);
    
    // Get complementary matches
    const complementaryAds = scoredAds
      .filter(item => item.category === 'complementary')
      .slice(0, complementaryCount)
      .map(item => item.ad);
    
    // Get discovery ads (those not matching other categories)
    const discoveryAds = scoredAds
      .filter(item => item.category === 'discovery')
      .slice(0, discoveryCount)
      .map(item => item.ad);
    
    // Combine all categories of ads, prioritizing primary matches
    const recommendedAds = [...primaryAds, ...complementaryAds, ...discoveryAds];
    
    // If we don't have enough ads, pad with whatever is available
    if (recommendedAds.length < limit) {
      // Find ads not already included
      const remainingAds = allAds.filter(ad => 
        !recommendedAds.some(recAd => recAd.id === ad.id)
      );
      
      // Add remaining ads up to the limit
      recommendedAds.push(...remainingAds.slice(0, limit - recommendedAds.length));
    }
    
    // Return the final list, limited to requested size
    return recommendedAds.slice(0, limit);
  }

  // Video Content Management System Methods
  
  async getAllVideos(): Promise<VideoContent[]> {
    return await db.select().from(videoContent);
  }
  
  async getPublishedVideos(): Promise<VideoContent[]> {
    return await db.select().from(videoContent).where(eq(videoContent.isPublished, true));
  }
  
  async getVideoContent(id: number): Promise<VideoContent | undefined> {
    const results = await db.select().from(videoContent).where(eq(videoContent.id, id));
    return results[0];
  }
  
  async getVideosByCategory(category: string): Promise<VideoContent[]> {
    return await db.select().from(videoContent).where(eq(videoContent.category, category));
  }
  
  async getVideosByChapter(chapterId: number): Promise<VideoContent[]> {
    return await db.select().from(videoContent).where(eq(videoContent.chapterId, chapterId));
  }
  
  async getFeaturedVideos(): Promise<VideoContent[]> {
    return await db.select().from(videoContent)
      .where(and(
        eq(videoContent.isPublished, true),
        eq(videoContent.featured, true)
      ));
  }
  
  async getVideosByUploader(uploaderId: number): Promise<VideoContent[]> {
    return await db.select().from(videoContent).where(eq(videoContent.uploadedBy, uploaderId));
  }
  
  async getVideosForUser(userId: number): Promise<VideoContent[]> {
    // This is a more complex query since it needs to handle the targetUserIds array
    // We'll get all published videos and filter them in the application
    const publishedVideos = await db.select().from(videoContent).where(eq(videoContent.isPublished, true));
    
    // Filter videos that are available to all users or targeted to this specific user
    return publishedVideos.filter(video => 
      !video.targetUserIds || // Available to all
      (video.targetUserIds && video.targetUserIds.includes(userId.toString())) // Targeted to this user
    );
  }
  
  async createVideoContent(video: InsertVideoContent): Promise<VideoContent> {
    const [newVideo] = await db.insert(videoContent).values({
      ...video,
      createdAt: video.createdAt || new Date(),
      updatedAt: video.updatedAt || new Date(),
      isPublished: video.isPublished !== undefined ? video.isPublished : false,
      isFeatured: video.isFeatured !== undefined ? video.isFeatured : false,
      viewCount: 0,
      completionCount: 0
    }).returning();
    
    return newVideo;
  }
  
  async updateVideoContent(id: number, video: Partial<InsertVideoContent>): Promise<VideoContent> {
    const [updatedVideo] = await db.update(videoContent)
      .set({
        ...video,
        updatedAt: new Date()
      })
      .where(eq(videoContent.id, id))
      .returning();
    
    if (!updatedVideo) {
      throw new Error(`Video content with ID ${id} not found`);
    }
    
    return updatedVideo;
  }
  
  async toggleVideoPublished(id: number, isPublished: boolean): Promise<VideoContent> {
    const [updatedVideo] = await db.update(videoContent)
      .set({
        isPublished,
        updatedAt: new Date()
      })
      .where(eq(videoContent.id, id))
      .returning();
    
    if (!updatedVideo) {
      throw new Error(`Video content with ID ${id} not found`);
    }
    
    return updatedVideo;
  }
  
  async deleteVideoContent(id: number): Promise<void> {
    const result = await db.delete(videoContent).where(eq(videoContent.id, id));
    // In a production system, consider soft deletes instead
  }
  
  // Video View Tracking Methods
  
  async getVideoViews(videoId: number): Promise<VideoView[]> {
    return await db.select().from(videoViews).where(eq(videoViews.videoId, videoId));
  }
  
  async getUserVideoViews(userId: number): Promise<VideoView[]> {
    return await db.select().from(videoViews).where(eq(videoViews.userId, userId));
  }
  
  async getVideoViewByUserAndVideo(userId: number, videoId: number): Promise<VideoView | undefined> {
    const results = await db.select().from(videoViews)
      .where(and(
        eq(videoViews.userId, userId),
        eq(videoViews.videoId, videoId)
      ));
    
    return results[0];
  }
  
  async createVideoView(view: InsertVideoView): Promise<VideoView> {
    const [newView] = await db.insert(videoViews).values({
      ...view,
      viewedAt: view.viewedAt || new Date(),
      completedAt: view.completedAt || null,
      watchTimeSeconds: view.watchTimeSeconds || 0,
      isCompleted: view.isCompleted || false
    }).returning();
    
    // Update view count on the video
    if (newView) {
      await db.update(videoContent)
        .set({
          viewCount: sql`${videoContent.viewCount} + 1`
        })
        .where(eq(videoContent.id, newView.videoId));
    }
    
    return newView;
  }
  
  async updateVideoView(id: number, view: Partial<InsertVideoView>): Promise<VideoView> {
    const [updatedView] = await db.update(videoViews)
      .set(view)
      .where(eq(videoViews.id, id))
      .returning();
    
    if (!updatedView) {
      throw new Error(`Video view with ID ${id} not found`);
    }
    
    return updatedView;
  }
  
  async markVideoCompleted(userId: number, videoId: number): Promise<VideoView> {
    // Find existing view
    const existingView = await this.getVideoViewByUserAndVideo(userId, videoId);
    
    if (!existingView) {
      // Create a new completed view if none exists
      return this.createVideoView({
        userId,
        videoId,
        isCompleted: true,
        completedAt: new Date(),
        watchTimeSeconds: 0,
      });
    }
    
    // If already completed, just return it
    if (existingView.isCompleted) {
      return existingView;
    }
    
    // Update existing view to mark as completed
    const [updatedView] = await db.update(videoViews)
      .set({
        isCompleted: true,
        completedAt: new Date()
      })
      .where(eq(videoViews.id, existingView.id))
      .returning();
    
    // Update completion count on the video
    await db.update(videoContent)
      .set({
        completionCount: sql`${videoContent.completionCount} + 1`
      })
      .where(eq(videoContent.id, videoId));
    
    return updatedView;
  }
  
  async getVideoCompletionStats(videoId: number): Promise<{ views: number, completions: number, averageWatchTime: number }> {
    // Get the video to check its view and completion counts
    const video = await this.getVideoContent(videoId);
    if (!video) {
      return { views: 0, completions: 0, averageWatchTime: 0 };
    }
    
    // Get all views of this video
    const views = await this.getVideoViews(videoId);
    
    // Calculate average watch time
    const totalWatchTime = views.reduce((sum, view) => sum + (view.watchTimeSeconds || 0), 0);
    const averageWatchTime = views.length > 0 ? totalWatchTime / views.length : 0;
    
    return {
      views: video.viewCount || 0,
      completions: video.completionCount || 0,
      averageWatchTime
    };
  }
  
  async getUserVideoStats(userId: number): Promise<{ videosAssigned: number, videosWatched: number, videosCompleted: number }> {
    // Get all videos assigned to this user
    const assignedVideos = await this.getVideosForUser(userId);
    
    // Get all views by this user
    const userViews = await this.getUserVideoViews(userId);
    
    // Get completed videos
    const completedViews = userViews.filter(view => view.isCompleted);
    
    return {
      videosAssigned: assignedVideos.length,
      videosWatched: userViews.length,
      videosCompleted: completedViews.length
    };
  }
}