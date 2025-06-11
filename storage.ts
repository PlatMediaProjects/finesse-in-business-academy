import session from "express-session";
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
  enrollmentCodes, type EnrollmentCode, type InsertEnrollmentCode,
  franchiseAds, type FranchiseAd, type InsertFranchiseAd,
  adInteractions, type AdInteraction, type InsertAdInteraction,
  userInterests, type UserInterests, type InsertUserInterests,
  videoContent, type VideoContent, type InsertVideoContent,
  videoViews, type VideoView, type InsertVideoView
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByEmail(email: string): Promise<User[]>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  getAllUsers(): Promise<User[]>; // Get all users
  getTutors(): Promise<User[]>; // Get all tutors
  updateUserRole(userId: number, isTutor: boolean, isInstructor: boolean, isFounder?: boolean): Promise<User>;
  updateUserNotificationPreferences(
    userId: number, 
    emailNotifications: boolean, 
    smsNotifications: boolean, 
    pushNotifications: boolean, 
    phone?: string
  ): Promise<User>;
  
  // Chapter methods
  getChapters(): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // Quiz methods
  getQuizQuestions(chapterId: number): Promise<QuizQuestion[]>;
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getChapterProgress(userId: number, chapterId: number): Promise<UserProgress | undefined>;
  updateProgress(progress: InsertUserProgress): Promise<UserProgress>;
  clearUserProgress(userId: number): Promise<void>; // Clear user progress
  getAllProgress(): Promise<UserProgress[]>; // Get all user progress for admin reports
  
  // Quiz attempts
  getQuizAttempts(userId: number, chapterId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  
  // Student workspace - drafts
  getStudentDrafts(userId: number): Promise<StudentDraft[]>;
  getStudentDraft(id: number): Promise<StudentDraft | undefined>;
  getDraftsByChapter(userId: number, chapterId: number): Promise<StudentDraft[]>;
  createDraft(draft: InsertStudentDraft): Promise<StudentDraft>;
  updateDraft(id: number, content: any, status: string): Promise<StudentDraft>;
  getAllStudentDrafts(): Promise<StudentDraft[]>; // Get all drafts for admin view
  
  // Tutor feedback
  getTutorFeedback(draftId: number): Promise<TutorFeedback[]>;
  createTutorFeedback(feedback: InsertTutorFeedback): Promise<TutorFeedback>;
  
  // Messaging system
  getInboxMessages(userId: number): Promise<Message[]>;
  getSentMessages(userId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
  
  // Notification system
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  bulkCreateNotifications(userIds: number[], notification: Omit<InsertNotification, 'userId'>): Promise<number>;
  
  // Notification templates
  getNotificationTemplates(): Promise<NotificationTemplate[]>;
  getNotificationTemplate(id: number): Promise<NotificationTemplate | undefined>;
  createNotificationTemplate(template: InsertNotificationTemplate): Promise<NotificationTemplate>;
  updateNotificationTemplate(id: number, template: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate>;
  toggleNotificationTemplateStatus(id: number, isActive: boolean): Promise<NotificationTemplate>;
  
  // Franchise Advertisement System
  getFranchiseAds(): Promise<FranchiseAd[]>;
  getFranchiseAd(id: number): Promise<FranchiseAd | undefined>;
  getActiveFranchiseAds(): Promise<FranchiseAd[]>;
  getFranchiseAdsByChapter(chapterId: number): Promise<FranchiseAd[]>;
  createFranchiseAd(ad: InsertFranchiseAd): Promise<FranchiseAd>;
  updateFranchiseAd(id: number, ad: Partial<InsertFranchiseAd>): Promise<FranchiseAd>;
  toggleFranchiseAdStatus(id: number, isActive: boolean): Promise<FranchiseAd>;
  deleteFranchiseAd(id: number): Promise<void>;
  
  // Ad Interactions
  getAdInteractions(adId: number): Promise<AdInteraction[]>;
  getUserAdInteractions(userId: number): Promise<AdInteraction[]>;
  getAdInteractionByUserAndAd(userId: number, adId: number): Promise<AdInteraction | undefined>;
  createAdInteraction(interaction: InsertAdInteraction): Promise<AdInteraction>;
  updateAdInteraction(id: number, interaction: Partial<InsertAdInteraction>): Promise<AdInteraction>;
  trackAdView(userId: number, adId: number, viewDuration?: number): Promise<AdInteraction>;
  submitAdComment(userId: number, adId: number, comment: string, interested: boolean): Promise<AdInteraction>;
  getAdStats(adId: number): Promise<{ views: number, comments: number, interested: number }>;
  getUserAdComplianceStatus(userId: number): Promise<{ requiredViews: number, completedViews: number, progress: number }>;
  
  // Enrollment code methods
  getEnrollmentCode(code: string): Promise<EnrollmentCode | undefined>;
  verifyEnrollmentCode(code: string): Promise<boolean>;
  markEnrollmentCodeUsed(code: string, userId: number): Promise<EnrollmentCode>;
  createEnrollmentCode(code: InsertEnrollmentCode): Promise<EnrollmentCode>;
  getAllEnrollmentCodes(): Promise<EnrollmentCode[]>;
  getActiveEnrollmentCodes(): Promise<EnrollmentCode[]>;
  getEnrollmentCodesByState(stateCode: string): Promise<EnrollmentCode[]>;
  toggleEnrollmentCodeUsed(id: number, isUsed: boolean): Promise<EnrollmentCode>;
  validateEnrollmentCode(code: string): Promise<EnrollmentCode | undefined>;
  deleteEnrollmentCode(id: number): Promise<void>;
  
  // User interests and recommendation system
  getUserInterests(userId: number): Promise<UserInterests | undefined>;
  createUserInterests(interests: InsertUserInterests): Promise<UserInterests>;
  updateUserInterests(userId: number, interests: Partial<InsertUserInterests>): Promise<UserInterests>;
  getRecommendedAds(userId: number, limit?: number): Promise<FranchiseAd[]>;
  
  // Video Content Management System for Student Workspace
  getAllVideos(): Promise<VideoContent[]>;
  getPublishedVideos(): Promise<VideoContent[]>;
  getVideoContent(id: number): Promise<VideoContent | undefined>;
  getVideosByCategory(category: string): Promise<VideoContent[]>;
  getVideosByChapter(chapterId: number): Promise<VideoContent[]>;
  getFeaturedVideos(): Promise<VideoContent[]>;
  getVideosByUploader(uploaderId: number): Promise<VideoContent[]>;
  getVideosForUser(userId: number): Promise<VideoContent[]>; // Filters videos based on targetUserIds
  createVideoContent(video: InsertVideoContent): Promise<VideoContent>;
  updateVideoContent(id: number, video: Partial<InsertVideoContent>): Promise<VideoContent>;
  toggleVideoPublished(id: number, isPublished: boolean): Promise<VideoContent>;
  deleteVideoContent(id: number): Promise<void>;
  
  // Video View Tracking
  getVideoViews(videoId: number): Promise<VideoView[]>;
  getUserVideoViews(userId: number): Promise<VideoView[]>;
  getVideoViewByUserAndVideo(userId: number, videoId: number): Promise<VideoView | undefined>;
  createVideoView(view: InsertVideoView): Promise<VideoView>;
  updateVideoView(id: number, view: Partial<InsertVideoView>): Promise<VideoView>;
  markVideoCompleted(userId: number, videoId: number): Promise<VideoView>;
  getVideoCompletionStats(videoId: number): Promise<{ views: number, completions: number, averageWatchTime: number }>;
  getUserVideoStats(userId: number): Promise<{ videosAssigned: number, videosWatched: number, videosCompleted: number }>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chapters: Map<number, Chapter>;
  private quizQuestions: Map<number, QuizQuestion>;
  private userProgress: Map<number, UserProgress>;
  private quizAttempts: Map<number, QuizAttempt>;
  private studentDrafts: Map<number, StudentDraft>;
  private tutorFeedback: Map<number, TutorFeedback>;
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  private notificationTemplates: Map<number, NotificationTemplate>;
  private userInterestsList: Map<number, UserInterests>;
  private franchiseAds: Map<number, FranchiseAd>;
  private adInteractions: Map<number, AdInteraction>;
  private enrollmentCodes: Map<number, EnrollmentCode>;
  private videoContents: Map<number, VideoContent>;
  private videoViewsList: Map<number, VideoView>;
  sessionStore: any;
  
  private userIdCounter: number;
  private chapterIdCounter: number;
  private questionIdCounter: number;
  private progressIdCounter: number;
  private attemptIdCounter: number;
  private draftIdCounter: number;
  private feedbackIdCounter: number;
  private messageIdCounter: number;
  private notificationIdCounter: number;
  private notificationTemplateIdCounter: number;
  private franchiseAdIdCounter: number;
  private adInteractionIdCounter: number;
  private enrollmentCodeIdCounter: number;
  private userInterestsIdCounter: number;
  private videoContentIdCounter: number;
  private videoViewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.chapters = new Map();
    this.quizQuestions = new Map();
    this.userProgress = new Map();
    this.quizAttempts = new Map();
    this.studentDrafts = new Map();
    this.tutorFeedback = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.notificationTemplates = new Map();
    this.userInterestsList = new Map();
    this.franchiseAds = new Map();
    this.adInteractions = new Map();
    this.enrollmentCodes = new Map();
    this.videoContents = new Map();
    this.videoViewsList = new Map();
    
    // Create in-memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.userIdCounter = 1;
    this.chapterIdCounter = 1;
    this.questionIdCounter = 1;
    this.progressIdCounter = 1;
    this.attemptIdCounter = 1;
    this.draftIdCounter = 1;
    this.feedbackIdCounter = 1;
    this.messageIdCounter = 1;
    this.notificationIdCounter = 1;
    this.notificationTemplateIdCounter = 1;
    this.userInterestsIdCounter = 1;
    this.franchiseAdIdCounter = 1;
    this.adInteractionIdCounter = 1;
    this.enrollmentCodeIdCounter = 1;
    this.videoContentIdCounter = 1;
    this.videoViewIdCounter = 1;
    
    // Initialize with sample content
    this.initializeData();
  }

  private initializeData() {
    // Create a default user and instructor
    this.createUser({
      username: "student",
      email: "student@example.com",
      password: "password",
      isInstructor: false
    });
    
    this.createUser({
      username: "instructor",
      email: "instructor@example.com",
      password: "password",
      isInstructor: true
    });
    
    // Create chapters and quiz questions using the module content
    // Chapter creation will be handled by the routes when initialized
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.email === email
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token && 
                user.resetTokenExpiry && 
                user.resetTokenExpiry > new Date()
    );
  }

  async updateUserResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.resetToken = token;
      user.resetTokenExpiry = expiry;
      this.users.set(userId, user);
    }
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      this.users.set(userId, user);
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async clearUserProgress(userId: number): Promise<void> {
    // Find all progress entries for this user and remove them
    const progressEntries = Array.from(this.userProgress.entries());
    for (const [progressId, progress] of progressEntries) {
      if (progress.userId === userId) {
        this.userProgress.delete(progressId);
      }
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Set default notification preferences according to user agreement
    const user: User = { 
      ...insertUser, 
      id,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      isInstructor: insertUser.isInstructor ?? false,
      isTutor: insertUser.isTutor ?? false,
      isFounder: insertUser.isFounder ?? false,
      emailNotifications: insertUser.emailNotifications ?? true,
      smsNotifications: insertUser.smsNotifications ?? true,
      pushNotifications: insertUser.pushNotifications ?? true,
      phone: insertUser.phone ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Chapter methods
  async getChapters(): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).sort((a, b) => a.number - b.number);
  }
  
  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }
  
  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = this.chapterIdCounter++;
    const chapter: Chapter = { ...insertChapter, id };
    this.chapters.set(id, chapter);
    return chapter;
  }
  
  // Quiz methods
  async getQuizQuestions(chapterId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values()).filter(
      (question) => question.chapterId === chapterId
    );
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }
  
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.questionIdCounter++;
    const question: QuizQuestion = { 
      ...insertQuestion, 
      id,
      explanation: insertQuestion.explanation || null 
    };
    this.quizQuestions.set(id, question);
    return question;
  }
  
  // Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }
  
  async getAllProgress(): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values());
  }
  
  async getChapterProgress(userId: number, chapterId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId && progress.chapterId === chapterId
    );
  }
  
  async updateProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists
    const existingProgress = await this.getChapterProgress(
      insertProgress.userId,
      insertProgress.chapterId
    );
    
    if (existingProgress) {
      const updatedProgress: UserProgress = {
        ...existingProgress,
        isCompleted: insertProgress.isCompleted ?? existingProgress.isCompleted,
        quizScore: insertProgress.quizScore ?? existingProgress.quizScore,
        lastAccessed: insertProgress.lastAccessed ?? new Date()
      };
      
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      // Create new progress entry
      const id = this.progressIdCounter++;
      const progress: UserProgress = { 
        id,
        userId: insertProgress.userId,
        chapterId: insertProgress.chapterId,
        isCompleted: insertProgress.isCompleted || false,
        quizScore: insertProgress.quizScore || null,
        lastAccessed: insertProgress.lastAccessed || new Date()
      };
      
      this.userProgress.set(id, progress);
      return progress;
    }
  }
  
  // Quiz attempts
  async getQuizAttempts(userId: number, chapterId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values())
      .filter((attempt) => attempt.userId === userId && attempt.chapterId === chapterId)
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return b.completedAt.getTime() - a.completedAt.getTime();
      });
  }
  
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.attemptIdCounter++;
    const attempt: QuizAttempt = { 
      ...insertAttempt, 
      id,
      completedAt: insertAttempt.completedAt ?? new Date()
    };
    
    this.quizAttempts.set(id, attempt);
    return attempt;
  }
  
  // User role management
  async getTutors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isTutor);
  }
  
  async updateUserRole(userId: number, isTutor: boolean, isInstructor: boolean, isFounder: boolean = false): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.isTutor = isTutor;
    user.isInstructor = isInstructor;
    user.isFounder = isFounder;
    this.users.set(userId, user);
    return user;
  }
  
  // Student workspace methods
  async getStudentDrafts(userId: number): Promise<StudentDraft[]> {
    return Array.from(this.studentDrafts.values())
      .filter(draft => draft.userId === userId)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }
  
  async getAllStudentDrafts(): Promise<StudentDraft[]> {
    return Array.from(this.studentDrafts.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }
  
  async getStudentDraft(id: number): Promise<StudentDraft | undefined> {
    return this.studentDrafts.get(id);
  }
  
  async getDraftsByChapter(userId: number, chapterId: number): Promise<StudentDraft[]> {
    return Array.from(this.studentDrafts.values())
      .filter(draft => draft.userId === userId && draft.chapterId === chapterId)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }
  
  async createDraft(draft: InsertStudentDraft): Promise<StudentDraft> {
    const id = this.draftIdCounter++;
    const newDraft: StudentDraft = {
      ...draft,
      id,
      lastUpdated: new Date()
    };
    
    this.studentDrafts.set(id, newDraft);
    return newDraft;
  }
  
  async updateDraft(id: number, content: any, status: string): Promise<StudentDraft> {
    const draft = this.studentDrafts.get(id);
    if (!draft) {
      throw new Error(`Draft with ID ${id} not found`);
    }
    
    const updatedDraft: StudentDraft = {
      ...draft,
      content,
      status,
      lastUpdated: new Date()
    };
    
    this.studentDrafts.set(id, updatedDraft);
    return updatedDraft;
  }
  
  // Tutor feedback methods
  async getTutorFeedback(draftId: number): Promise<TutorFeedback[]> {
    return Array.from(this.tutorFeedback.values())
      .filter(feedback => feedback.draftId === draftId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createTutorFeedback(feedback: InsertTutorFeedback): Promise<TutorFeedback> {
    const id = this.feedbackIdCounter++;
    const newFeedback: TutorFeedback = {
      ...feedback,
      id,
      createdAt: new Date()
    };
    
    this.tutorFeedback.set(id, newFeedback);
    return newFeedback;
  }
  
  // Messaging system methods
  async getInboxMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.recipientId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }
  
  async getSentMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      isRead: false,
      sentAt: new Date(),
      readAt: null
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) {
      throw new Error(`Message with ID ${id} not found`);
    }
    
    const updatedMessage: Message = {
      ...message,
      isRead: true,
      readAt: new Date()
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // User Interests methods
  async getUserInterests(userId: number): Promise<UserInterests | undefined> {
    return Array.from(this.userInterestsList.values()).find(
      (interest) => interest.userId === userId
    );
  }

  async createUserInterests(interests: InsertUserInterests): Promise<UserInterests> {
    const id = this.userInterestsIdCounter++;
    const userInterests: UserInterests = { 
      ...interests, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      primaryMatchWeight: interests.primaryMatchWeight || 60,
      complementaryMatchWeight: interests.complementaryMatchWeight || 30,
      discoveryWeight: interests.discoveryWeight || 10
    };
    this.userInterestsList.set(id, userInterests);
    return userInterests;
  }

  async updateUserInterests(userId: number, interests: Partial<InsertUserInterests>): Promise<UserInterests> {
    // Check if interests already exist for this user
    const existingInterests = await this.getUserInterests(userId);
    
    if (existingInterests) {
      const updatedInterests: UserInterests = {
        ...existingInterests,
        ...interests,
        updatedAt: new Date()
      };
      
      this.userInterestsList.set(existingInterests.id, updatedInterests);
      return updatedInterests;
    } else {
      // Create new interests entry
      return this.createUserInterests({
        userId,
        interests: interests.interests || '',
        foodPreferences: interests.foodPreferences || '',
        hobbyPreferences: interests.hobbyPreferences || '',
        businessInterests: interests.businessInterests || '',
        primaryMatchWeight: interests.primaryMatchWeight || 60,
        complementaryMatchWeight: interests.complementaryMatchWeight || 30,
        discoveryWeight: interests.discoveryWeight || 10
      });
    }
  }

  // Enrollment code methods
  async getEnrollmentCode(code: string): Promise<EnrollmentCode | undefined> {
    return Array.from(this.enrollmentCodes.values()).find(
      (enrollmentCode) => enrollmentCode.code === code
    );
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
    const enrollmentCode = await this.getEnrollmentCode(code);
    if (!enrollmentCode) {
      throw new Error('Enrollment code not found');
    }
    
    enrollmentCode.isUsed = true;
    enrollmentCode.usedBy = userId;
    enrollmentCode.usedAt = new Date();
    
    this.enrollmentCodes.set(enrollmentCode.id, enrollmentCode);
    return enrollmentCode;
  }

  async createEnrollmentCode(insertCode: InsertEnrollmentCode): Promise<EnrollmentCode> {
    const id = this.enrollmentCodeIdCounter++;
    const enrollmentCode: EnrollmentCode = {
      ...insertCode,
      id,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date()
    };
    
    this.enrollmentCodes.set(id, enrollmentCode);
    return enrollmentCode;
  }

  async getAllEnrollmentCodes(): Promise<EnrollmentCode[]> {
    return Array.from(this.enrollmentCodes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveEnrollmentCodes(): Promise<EnrollmentCode[]> {
    return Array.from(this.enrollmentCodes.values())
      .filter(code => !code.isUsed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEnrollmentCodesByState(stateCode: string): Promise<EnrollmentCode[]> {
    return Array.from(this.enrollmentCodes.values())
      .filter(code => code.code.startsWith(stateCode))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async toggleEnrollmentCodeUsed(id: number, isUsed: boolean): Promise<EnrollmentCode> {
    const enrollmentCode = this.enrollmentCodes.get(id);
    if (!enrollmentCode) {
      throw new Error('Enrollment code not found');
    }
    
    enrollmentCode.isUsed = isUsed;
    
    // If marking as unused, clear the used by information
    if (!isUsed) {
      enrollmentCode.usedBy = null;
      enrollmentCode.usedAt = null;
    }
    
    this.enrollmentCodes.set(id, enrollmentCode);
    return enrollmentCode;
  }

  async validateEnrollmentCode(code: string): Promise<EnrollmentCode | undefined> {
    const enrollmentCode = await this.getEnrollmentCode(code);
    if (!enrollmentCode || enrollmentCode.isUsed) {
      return undefined;
    }
    
    return enrollmentCode;
  }

  async deleteEnrollmentCode(id: number): Promise<void> {
    this.enrollmentCodes.delete(id);
  }

  async getRecommendedAds(userId: number, limit: number = 10): Promise<FranchiseAd[]> {
    // Get user interests
    const userPreferences = await this.getUserInterests(userId);
    
    // If no preferences, return random ads
    if (!userPreferences) {
      const allAds = Array.from(this.franchiseAds.values()).filter(ad => ad.isActive);
      return allAds.slice(0, limit);
    }
    
    // Get all active ads
    const allAds = Array.from(this.franchiseAds.values()).filter(ad => ad.isActive);
    
    if (allAds.length === 0) {
      return [];
    }

    // Parse user interests
    const userInterests = userPreferences.interests ? userPreferences.interests.split(',').map(i => i.trim().toLowerCase()) : [];
    const userFood = userPreferences.foodPreferences ? userPreferences.foodPreferences.split(',').map(i => i.trim().toLowerCase()) : [];
    const userHobbies = userPreferences.hobbyPreferences ? userPreferences.hobbyPreferences.split(',').map(i => i.trim().toLowerCase()) : [];
    const userBusiness = userPreferences.businessInterests ? userPreferences.businessInterests.split(',').map(i => i.trim().toLowerCase()) : [];
    
    // All user preferences combined
    const allUserPreferences = [...userInterests, ...userFood, ...userHobbies, ...userBusiness];
    
    // Score and categorize ads
    const scoredAds = allAds.map(ad => {
      // Parse ad tags
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
    
    // Sort by score and priority
    scoredAds.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
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
    
    // Get discovery ads
    const discoveryAds = scoredAds
      .filter(item => item.category === 'discovery')
      .slice(0, discoveryCount)
      .map(item => item.ad);
    
    // Combine all categories of ads
    const recommendedAds = [...primaryAds, ...complementaryAds, ...discoveryAds];
    
    // If we don't have enough ads, pad with more
    if (recommendedAds.length < limit) {
      // Find ads not already included
      const remainingAds = allAds.filter(ad => 
        !recommendedAds.some(recAd => recAd.id === ad.id)
      );
      
      // Add remaining ads up to the limit
      recommendedAds.push(...remainingAds.slice(0, limit - recommendedAds.length));
    }
    
    // Return the final list
    return recommendedAds.slice(0, limit);
  }

  // Video Content Management System Methods
  
  async getAllVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values());
  }
  
  async getPublishedVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values())
      .filter(video => video.isPublished);
  }
  
  async getVideoContent(id: number): Promise<VideoContent | undefined> {
    return this.videoContents.get(id);
  }
  
  async getVideosByCategory(category: string): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values())
      .filter(video => video.category === category);
  }
  
  async getVideosByChapter(chapterId: number): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values())
      .filter(video => video.chapterId === chapterId);
  }
  
  async getFeaturedVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values())
      .filter(video => video.isFeatured && video.isPublished);
  }
  
  async getVideosByUploader(uploaderId: number): Promise<VideoContent[]> {
    return Array.from(this.videoContents.values())
      .filter(video => video.uploadedBy === uploaderId);
  }
  
  async getVideosForUser(userId: number): Promise<VideoContent[]> {
    // Return videos specifically targeted to this user or available to all users
    return Array.from(this.videoContents.values())
      .filter(video => 
        video.isPublished && (
          // Video is available to all users
          !video.targetUserIds || 
          // Video is targeted to specific user
          video.targetUserIds.includes(userId.toString())
        )
      );
  }
  
  async createVideoContent(video: InsertVideoContent): Promise<VideoContent> {
    const id = this.videoContentIdCounter++;
    const newVideo: VideoContent = {
      id,
      ...video,
      createdAt: video.createdAt || new Date(),
      updatedAt: video.updatedAt || new Date(),
      isPublished: video.isPublished !== undefined ? video.isPublished : false,
      isFeatured: video.isFeatured !== undefined ? video.isFeatured : false,
      viewCount: 0,
      completionCount: 0
    };
    
    this.videoContents.set(id, newVideo);
    return newVideo;
  }
  
  async updateVideoContent(id: number, video: Partial<InsertVideoContent>): Promise<VideoContent> {
    const existingVideo = this.videoContents.get(id);
    if (!existingVideo) {
      throw new Error(`Video content with ID ${id} not found`);
    }
    
    const updatedVideo: VideoContent = {
      ...existingVideo,
      ...video,
      updatedAt: new Date()
    };
    
    this.videoContents.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async toggleVideoPublished(id: number, isPublished: boolean): Promise<VideoContent> {
    const existingVideo = this.videoContents.get(id);
    if (!existingVideo) {
      throw new Error(`Video content with ID ${id} not found`);
    }
    
    const updatedVideo: VideoContent = {
      ...existingVideo,
      isPublished,
      updatedAt: new Date()
    };
    
    this.videoContents.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async deleteVideoContent(id: number): Promise<void> {
    if (!this.videoContents.has(id)) {
      throw new Error(`Video content with ID ${id} not found`);
    }
    
    this.videoContents.delete(id);
  }
  
  // Video View Tracking Methods
  
  async getVideoViews(videoId: number): Promise<VideoView[]> {
    return Array.from(this.videoViewsList.values())
      .filter(view => view.videoId === videoId);
  }
  
  async getUserVideoViews(userId: number): Promise<VideoView[]> {
    return Array.from(this.videoViewsList.values())
      .filter(view => view.userId === userId);
  }
  
  async getVideoViewByUserAndVideo(userId: number, videoId: number): Promise<VideoView | undefined> {
    return Array.from(this.videoViewsList.values())
      .find(view => view.userId === userId && view.videoId === videoId);
  }
  
  async createVideoView(view: InsertVideoView): Promise<VideoView> {
    const id = this.videoViewIdCounter++;
    const newView: VideoView = {
      id,
      ...view,
      viewedAt: view.viewedAt || new Date(),
      completedAt: view.completedAt || null,
      watchTimeSeconds: view.watchTimeSeconds || 0,
      isCompleted: view.isCompleted || false
    };
    
    this.videoViewsList.set(id, newView);
    
    // Update view count on the video
    const video = this.videoContents.get(view.videoId);
    if (video) {
      video.viewCount = (video.viewCount || 0) + 1;
      this.videoContents.set(video.id, video);
    }
    
    return newView;
  }
  
  async updateVideoView(id: number, view: Partial<InsertVideoView>): Promise<VideoView> {
    const existingView = this.videoViewsList.get(id);
    if (!existingView) {
      throw new Error(`Video view with ID ${id} not found`);
    }
    
    const updatedView: VideoView = {
      ...existingView,
      ...view,
    };
    
    this.videoViewsList.set(id, updatedView);
    return updatedView;
  }
  
  async markVideoCompleted(userId: number, videoId: number): Promise<VideoView> {
    // Find existing view
    const existingView = Array.from(this.videoViewsList.values())
      .find(view => view.userId === userId && view.videoId === videoId);
    
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
    
    // Update existing view
    const updatedView: VideoView = {
      ...existingView,
      isCompleted: true,
      completedAt: new Date()
    };
    
    this.videoViewsList.set(existingView.id, updatedView);
    
    // Update completion count on the video
    const video = this.videoContents.get(videoId);
    if (video && !existingView.isCompleted) {
      video.completionCount = (video.completionCount || 0) + 1;
      this.videoContents.set(videoId, video);
    }
    
    return updatedView;
  }
  
  async getVideoCompletionStats(videoId: number): Promise<{ views: number, completions: number, averageWatchTime: number }> {
    const views = Array.from(this.videoViewsList.values())
      .filter(view => view.videoId === videoId);
      
    const completions = views.filter(view => view.isCompleted);
    const totalWatchTime = views.reduce((sum, view) => sum + (view.watchTimeSeconds || 0), 0);
    const averageWatchTime = views.length > 0 ? totalWatchTime / views.length : 0;
    
    return {
      views: views.length,
      completions: completions.length,
      averageWatchTime
    };
  }
  
  async getUserVideoStats(userId: number): Promise<{ videosAssigned: number, videosWatched: number, videosCompleted: number }> {
    // Get all videos assigned to this user
    const assignedVideos = await this.getVideosForUser(userId);
    
    // Get all views by this user
    const userViews = Array.from(this.videoViewsList.values())
      .filter(view => view.userId === userId);
      
    // Get completed videos
    const completedViews = userViews.filter(view => view.isCompleted);
    
    return {
      videosAssigned: assignedVideos.length,
      videosWatched: userViews.length,
      videosCompleted: completedViews.length
    };
  }
}

// Use DatabaseStorage when DATABASE_URL is available, otherwise fallback to MemStorage
import { DatabaseStorage } from "./storage.database";

export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
