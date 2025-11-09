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
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "teacher"]);
export const questionTypeEnum = pgEnum("question_type", ["mcq", "short", "essay"]);
export const sourceEnum = pgEnum("source", ["ai", "upload", "seed"]);

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
    xp: integer("xp").default(0).notNull(),
    coins: integer("coins").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    streakFreezeTokens: integer("streak_freeze_tokens").default(0).notNull(),
    lastStreakUpdate: timestamp("last_streak_update").defaultNow(),
    freeExpiresAt: timestamp("free_expires_at").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: index("users_openId_idx").on(table.openId),
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Student profiles
export const studentProfiles = mysqlTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    gradeLevel: varchar("grade_level", { length: 20 }).notNull(),
    county: varchar("county", { length: 100 }),
    school: varchar("school", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("student_profiles_user_id_idx").on(table.userId),
  })
);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

// Quizzes
export const quizzes = mysqlTable(
  "quizzes",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    gradeLevel: varchar("grade_level", { length: 20 }),
    source: sourceEnum.notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("quizzes_user_id_idx").on(table.userId),
  })
);

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// Questions
export const questions = mysqlTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    quizId: int("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    questionType: questionTypeEnum.notNull(),
    options: json("options"),
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    points: int("points").default(10).notNull(),
  },
  (table) => ({
    quizIdIdx: index("questions_quiz_id_idx").on(table.quizId),
  })
);

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// Results
export const results = mysqlTable(
  "results",
  {
    id: serial("id").primaryKey(),
    quizId: int("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    score: int("score").notNull(),
    totalPoints: int("total_points").notNull(),
    xpEarned: int("xp_earned").default(0).notNull(),
    coinsEarned: int("coins_earned").default(0).notNull(),
    feedback: json("feedback"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("results_user_id_idx").on(table.userId),
    quizIdIdx: index("results_quiz_id_idx").on(table.quizId),
  })
);

export type Result = typeof results.$inferSelect;
export type InsertResult = typeof results.$inferInsert;

// Notes
export const notes = mysqlTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    subject: varchar("subject", { length: 100 }),
    gradeLevel: varchar("grade_level", { length: 20 }),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
  })
);

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// Past papers
export const pastPapers = mysqlTable(
  "past_papers",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    gradeLevel: varchar("grade_level", { length: 20 }).notNull(),
    examBoard: varchar("exam_board", { length: 50 }),
    year: int("year"),
    fileUrl: text("file_url"),
    uploadedBy: int("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    subjectIdx: index("past_papers_subject_idx").on(table.subject),
    gradeLevelIdx: index("past_papers_grade_level_idx").on(table.gradeLevel),
  })
);

export type PastPaper = typeof pastPapers.$inferSelect;
export type InsertPastPaper = typeof pastPapers.$inferInsert;

// Leaderboard
export const leaderboard = mysqlTable(
  "leaderboard",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    totalXp: int("total_xp").default(0).notNull(),
    totalCoins: int("total_coins").default(0).notNull(),
    rank: int("rank"),
    county: varchar("county", { length: 100 }),
    school: varchar("school", { length: 255 }),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("leaderboard_user_id_idx").on(table.userId),
  })
);

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

// Payments
export const payments = mysqlTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: int("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("KES").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    transactionId: varchar("transaction_id", { length: 100 }).unique(),
    paymentMethod: varchar("payment_method", { length: 50 }),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("payments_user_id_idx").on(table.userId),
    transactionIdIdx: index("payments_transaction_id_idx").on(table.transactionId),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  studentProfiles: many(studentProfiles),
  quizzes: many(quizzes),
  notes: many(notes),
  results: many(results),
  payments: many(payments),
  leaderboardEntry: one(leaderboard),
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
  quiz: one(quizzes, {
    fields: [results.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [results.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const pastPapersRelations = relations(pastPapers, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [pastPapers.uploadedBy],
    references: [users.id],
  }),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  user: one(users, {
    fields: [leaderboard.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
