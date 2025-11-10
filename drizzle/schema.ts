import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * PostgreSQL/Supabase Schema for Tkrell
 * Migrated from MySQL to support Supabase deployment
 */

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "teacher"]);
export const questionTypeEnum = pgEnum("question_type", ["mcq", "short", "essay"]);
export const sourceEnum = pgEnum("source", ["ai", "upload", "seed"]);
export const visibilityEnum = pgEnum("visibility", ["public", "private", "class"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "file", "image"]);

// Core user table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: roleEnum("role").default("user").notNull(),
    // Gamification fields
    xp: integer("xp").default(0).notNull(),
    coins: integer("coins").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    streakFreezeTokens: integer("streak_freeze_tokens").default(0).notNull(),
    lastStreakUpdate: timestamp("last_streak_update", { withTimezone: true }),
    freeExpiresAt: timestamp("free_expires_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: uniqueIndex("users_openId_idx").on(table.openId),
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Student Profile
export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    gradeLevel: varchar("grade_level", { length: 20 }),
    county: varchar("county", { length: 100 }),
    school: varchar("school", { length: 255 }),
    subjects: json("subjects").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("student_profiles_user_id_idx").on(table.userId),
  })
);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

// Quizzes
export const quizzes = pgTable(
  "quizzes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    topic: varchar("topic", { length: 100 }),
    difficulty: varchar("difficulty", { length: 50 }),
    totalQuestions: integer("total_questions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("quizzes_user_id_idx").on(table.userId),
  })
);

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// Questions
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    type: questionTypeEnum("type").notNull(),
    options: json("options").$type<string[]>(),
    answer: text("answer").notNull(),
    explanation: text("explanation"),
    points: integer("points").default(1).notNull(),
    source: sourceEnum("source").default("ai").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quizIdIdx: index("questions_quiz_id_idx").on(table.quizId),
  })
);

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// Results
export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    totalPoints: integer("total_points").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
    durationSeconds: integer("duration_seconds"),
    answers: json("answers").$type<any>(),
  },
  (table) => ({
    userIdIdx: index("results_user_id_idx").on(table.userId),
    quizIdIdx: index("results_quiz_id_idx").on(table.quizId),
  })
);

export type Result = typeof results.$inferSelect;
export type InsertResult = typeof results.$inferInsert;

// Notes (Enhanced with visibility and tags)
export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    subject: varchar("subject", { length: 100 }),
    topic: varchar("topic", { length: 100 }),
    gradeLevel: varchar("grade_level", { length: 20 }),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    tags: json("tags").$type<string[]>(),
    views: integer("views").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
    subjectIdx: index("notes_subject_idx").on(table.subject),
    visibilityIdx: index("notes_visibility_idx").on(table.visibility),
  })
);

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// Past papers
export const pastPapers = pgTable(
  "past_papers",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    gradeLevel: varchar("grade_level", { length: 20 }).notNull(),
    examBoard: varchar("exam_board", { length: 50 }),
    year: integer("year"),
    fileUrl: text("file_url"),
    uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    subjectIdx: index("past_papers_subject_idx").on(table.subject),
    gradeIdx: index("past_papers_grade_idx").on(table.gradeLevel),
  })
);

export type PastPaper = typeof pastPapers.$inferSelect;
export type InsertPastPaper = typeof pastPapers.$inferInsert;

// Leaderboard
export const leaderboard = pgTable(
  "leaderboard",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    totalXp: integer("total_xp").default(0).notNull(),
    totalCoins: integer("total_coins").default(0).notNull(),
    rank: integer("rank"),
    county: varchar("county", { length: 100 }),
    school: varchar("school", { length: 255 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("leaderboard_user_id_idx").on(table.userId),
    xpIdx: index("leaderboard_xp_idx").on(table.totalXp),
  })
);

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

// Payments
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    transactionRef: varchar("transaction_ref", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 50 }).default('pending').notNull(),
    tier: varchar("tier", { length: 50 }),
    mpesaCode: varchar("mpesa_code", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("payments_user_id_idx").on(table.userId),
    refIdx: uniqueIndex("payments_transaction_ref_idx").on(table.transactionRef),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Referral system
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
    redeemed: integer("redeemed").default(0).notNull(),
    referredId: integer("referred_id").references(() => users.id, { onDelete: "set null" }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("referrals_user_id_idx").on(table.userId),
  })
);

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// Classes/Schools
export const classes = pgTable(
  "classes",
  {
    id: serial("id").primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 100 }),
    gradeLevel: varchar("grade_level", { length: 20 }),
    code: varchar("code", { length: 20 }).unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    teacherIdIdx: uniqueIndex("classes_teacher_id_idx").on(table.teacherId),
  })
);

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

// Class Enrollments
export const classEnrollments = pgTable(
  "class_enrollments",
  {
    id: serial("id").primaryKey(),
    classId: integer("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    studentId: integer("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    classIdIdx: index("class_enrollments_class_id_idx").on(table.classId),
    studentIdIdx: index("class_enrollments_student_id_idx").on(table.studentId),
    uniqueEnrollment: uniqueIndex("unique_enrollment").on(table.classId, table.studentId),
  })
);

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = typeof classEnrollments.$inferInsert;

// Uploads/Resources (for sharing study materials)
export const uploads = pgTable(
  "uploads",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }),
    fileSize: integer("file_size"),
    subject: varchar("subject", { length: 100 }),
    topic: varchar("topic", { length: 100 }),
    gradeLevel: varchar("grade_level", { length: 20 }),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    tags: json("tags").$type<string[]>(),
    downloads: integer("downloads").default(0).notNull(),
    views: integer("views").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("uploads_user_id_idx").on(table.userId),
    subjectIdx: index("uploads_subject_idx").on(table.subject),
    visibilityIdx: index("uploads_visibility_idx").on(table.visibility),
  })
);

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

// Conversations (for DM system)
export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    participant1Id: integer("participant1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    participant2Id: integer("participant2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    participant1Idx: index("conversations_participant1_idx").on(table.participant1Id),
    participant2Idx: index("conversations_participant2_idx").on(table.participant2Id),
    uniqueConversation: uniqueIndex("unique_conversation").on(table.participant1Id, table.participant2Id),
  })
);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages (for DM and class chat)
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
    classId: integer("class_id").references(() => classes.id, { onDelete: "cascade" }),
    senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    messageType: messageTypeEnum("message_type").default("text").notNull(),
    fileUrl: text("file_url"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("messages_conversation_id_idx").on(table.conversationId),
    classIdIdx: index("messages_class_id_idx").on(table.classId),
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Likes (for notes and uploads)
export const likes = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    noteId: integer("note_id").references(() => notes.id, { onDelete: "cascade" }),
    uploadId: integer("upload_id").references(() => uploads.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("likes_user_id_idx").on(table.userId),
    noteIdIdx: index("likes_note_id_idx").on(table.noteId),
    uploadIdIdx: index("likes_upload_id_idx").on(table.uploadId),
  })
);

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  quizzes: many(quizzes),
  results: many(results),
  notes: many(notes),
  pastPapers: many(pastPapers),
  payments: many(payments),
  referrals: many(referrals),
  classesTaught: many(classes),
  classEnrollments: many(classEnrollments),
  uploads: many(uploads),
  sentMessages: many(messages),
  likes: many(likes),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  questions: many(questions),
  results: many(results),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  user: one(users, {
    fields: [results.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [results.quizId],
    references: [quizzes.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const pastPapersRelations = relations(pastPapers, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [pastPapers.uploadedBy],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  user: one(users, {
    fields: [referrals.userId],
    references: [users.id],
  }),
  referredUser: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classEnrollments.studentId],
    references: [users.id],
  }),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
  likes: many(likes),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  class: one(classes, {
    fields: [messages.classId],
    references: [classes.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  note: one(notes, {
    fields: [likes.noteId],
    references: [notes.id],
  }),
  upload: one(uploads, {
    fields: [likes.uploadId],
    references: [uploads.id],
  }),
}));
