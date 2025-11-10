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

// Notes
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
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
