import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, users, studentProfiles, InsertStudentProfile,
  quizzes, InsertQuiz, questions, InsertQuestion,
  results, InsertResult, notes, InsertNote,
  pastPapers, InsertPastPaper,
  leaderboard, InsertLeaderboard, payments, InsertPayment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Set free trial expiration to 1 year from now for new users
    if (!values.freeExpiresAt) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      values.freeExpiresAt = oneYearFromNow;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserGamification(userId: number, updates: { xp?: number; coins?: number; streak?: number; level?: number }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(updates).where(eq(users.id, userId));
}

// Student Profile helpers
export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStudentProfile(profile: InsertStudentProfile) {
  const db = await getDb();
  if (!db) return;
  const existing = await getStudentProfile(profile.userId);
  if (existing) {
    await db.update(studentProfiles).set(profile).where(eq(studentProfiles.userId, profile.userId));
  } else {
    await db.insert(studentProfiles).values(profile);
  }
}

// Quiz helpers
export async function createQuiz(quiz: InsertQuiz) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(quizzes).values(quiz);
  return Number(result[0].insertId);
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserQuizzes(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizzes).where(eq(quizzes.userId, userId)).orderBy(desc(quizzes.createdAt)).limit(limit);
}

// Question helpers
export async function createQuestions(questionList: InsertQuestion[]) {
  const db = await getDb();
  if (!db) return;
  await db.insert(questions).values(questionList);
}

export async function getQuizQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions).where(eq(questions.quizId, quizId));
}

// Result helpers
export async function createResult(result: InsertResult) {
  const db = await getDb();
  if (!db) return null;
  const res = await db.insert(results).values(result);
  return Number(res[0].insertId);
}

export async function getUserResults(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(results).where(eq(results.userId, userId)).orderBy(desc(results.completedAt)).limit(limit);
}

// Notes helpers
export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notes).values(note);
  return Number(result[0].insertId);
}

export async function getUserNotes(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt)).limit(limit);
}

export async function deleteNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

// Placeholder helpers for future features
export async function createUpload(upload: any) {
  console.log('Upload feature not yet implemented');
  return null;
}

export async function getUserUploads(userId: number, limit = 20) {
  return [];
}

export async function getCachedAIResponse(promptHash: string) {
  return undefined;
}

export async function cacheAIResponse(cache: any) {
  console.log('AI cache not yet implemented');
}

export async function createChat(chat: any) {
  console.log('Chat feature not yet implemented');
  return null;
}

export async function getUserChats(userId: number, limit = 50) {
  return [];
}

export async function logAnalyticsEvent(event: any) {
  console.log('Analytics not yet implemented');
}

export async function createReferral(referral: any) {
  console.log('Referral feature not yet implemented');
  return null;
}

export async function getReferralByCode(code: string) {
  return undefined;
}

export async function redeemReferral(code: string, referredId: number) {
  return false;
}

// Leaderboard helpers
export async function getLeaderboard(county?: string, school?: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    id: leaderboard.id,
    userId: leaderboard.userId,
    totalXp: leaderboard.totalXp,
    county: leaderboard.county,
    school: leaderboard.school,
    rank: leaderboard.rank,
    userName: users.name,
  }).from(leaderboard).leftJoin(users, eq(leaderboard.userId, users.id));

  if (county) {
    query = query.where(eq(leaderboard.county, county)) as any;
  }
  if (school) {
    query = query.where(eq(leaderboard.school, school)) as any;
  }

  return await query.orderBy(desc(leaderboard.totalXp)).limit(limit);
}

export async function updateLeaderboard(userId: number, xp: number, county?: string, school?: string) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(leaderboard).set({ totalXp: xp, county, school }).where(eq(leaderboard.userId, userId));
  } else {
    await db.insert(leaderboard).values({ userId, totalXp: xp, county, school });
  }
}

// Class helpers - placeholder for future implementation
export async function createClass(classData: any) {
  console.log('Class feature not yet implemented');
  return null;
}

export async function getTeacherClasses(teacherId: number) {
  return [];
}

export async function enrollStudent(enrollment: any) {
  console.log('Enrollment not yet implemented');
}

export async function getClassStudents(classId: number) {
  return [];
}

export async function createClassroom(teacherId: number, name: string, gradeLevel: string, subject?: string) {
  console.log('Classroom feature not yet implemented');
  return null;
}

export async function getTeacherClassrooms(teacherId: number) {
  return [];
}

export async function addStudentsToClass(classId: number, studentEmails: string[]) {
  console.log('Add students not yet implemented');
}

export async function assignQuizToClass(classId: number, quizId: number, dueDate?: Date) {
  console.log(`Quiz ${quizId} assigned to class ${classId}, due: ${dueDate}`);
}

export async function getClassAnalytics(classId: number) {
  return { students: 0, averageScore: 0, completedQuizzes: 0 };
}


// Payment Transaction helpers
export interface PendingTransaction {
  userId: number;
  transactionRef: string;
  amount: number;
  tier: 'premium' | 'vip';
  phoneNumber: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface UserSubscription {
  userId: number;
  tier: 'premium' | 'vip';
  expiresAt: Date;
  transactionId?: number;
}

export async function createPendingTransaction(transaction: PendingTransaction) {
  const db = await getDb();
  if (!db) return null;
  
  // For now, store in a simple in-memory map or database
  // In production, create a transactions table
  console.log('Transaction created:', transaction);
  return transaction.transactionRef;
}

export async function updateTransactionStatus(
  transactionRef: string,
  status: 'pending' | 'completed' | 'failed',
  mpesaCode?: string
) {
  const db = await getDb();
  if (!db) return;
  
  console.log('Transaction updated:', { transactionRef, status, mpesaCode });
}

export async function getTransactionByRef(transactionRef: string): Promise<any> {
  // In production, query from transactions table
  console.log('Getting transaction:', transactionRef);
  return null;
}

export async function createOrUpdateSubscription(subscription: UserSubscription) {
  const db = await getDb();
  if (!db) return;
  
  console.log('Subscription created/updated:', subscription);
}

export async function getUserSubscription(userId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  
  // In production, query from subscriptions table
  return null;
}

export async function cancelUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  console.log('Subscription cancelled for user:', userId);
}

export async function getUserTransactions(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  // In production, query from transactions table
  return [];
}
