import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import crypto from "crypto";
import { uploadsRouter } from "./routers/uploads";
import { chatRouter } from "./routers/chat";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return crypto.randomBytes(8).toString('hex');
}

// Helper to hash prompts for caching
function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Helper to calculate XP and coins based on score
function calculateRewards(score: number, totalPoints: number): { xp: number; coins: number } {
  const percentage = (score / totalPoints) * 100;
  let xp = Math.floor(score * 2);
  let coins = Math.floor(score / 10);
  
  if (percentage === 100) {
    xp += 50; // Perfect score bonus
    coins += 20;
  } else if (percentage >= 80) {
    xp += 20;
    coins += 10;
  }
  
  return { xp, coins };
}

// Helper to update user level based on XP
function calculateLevel(xp: number): number {
  // Simple level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export const appRouter = router({
  system: systemRouter,
  uploads: uploadsRouter,
  messaging: chatRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Student profile management
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentProfile(ctx.user.id);
      return profile || null;
    }),
    
    upsert: protectedProcedure
      .input(z.object({
        gradeLevel: z.string(),
        county: z.string().optional(),
        school: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertStudentProfile({
          userId: ctx.user.id,
          gradeLevel: input.gradeLevel,
          county: input.county,
          school: input.school,
        });
        return { success: true };
      }),
  }),

  // AI Question Generation
  quiz: router({
    generate: protectedProcedure
      .input(z.object({
        topic: z.string(),
        gradeLevel: z.string().optional(),
        count: z.number().min(1).max(20).default(7),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new Error("User not found");

        // Check cache first
        const promptText = `Generate ${input.count} questions for topic: ${input.topic}, grade: ${input.gradeLevel || 'general'}`;
        const promptHash = hashPrompt(promptText);
        const cached = await db.getCachedAIResponse(promptHash);

        let questionsData;
        if (cached) {
          questionsData = JSON.parse(cached.response);
        } else {
          // Generate with AI
          const systemPrompt = `You are Mr. T, a friendly Kenyan tutor. Generate ${input.count} exam-style questions for the topic "${input.topic}" suitable for ${input.gradeLevel || 'general'} level. Return ONLY a valid JSON array with this exact structure: [{"question":"...","type":"mcq","options":["A","B","C","D"],"answer":"A","explanation":"...","points":10}]. For short answer questions use type "short", for essays use type "essay" (no options needed).`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate ${input.count} questions about: ${input.topic}` },
            ],
          });

          const content = typeof response.choices[0].message.content === 'string' 
            ? response.choices[0].message.content 
            : JSON.stringify(response.choices[0].message.content);
          
          // Try to extract JSON from the response
          let jsonMatch = content.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            throw new Error("Failed to generate valid questions");
          }
          
          questionsData = JSON.parse(jsonMatch[0]);

          // Cache the response
          await db.cacheAIResponse({
            promptHash,
            prompt: promptText,
            response: JSON.stringify(questionsData),
            modelUsed: "gpt-4o-mini",
          });
        }

        // Create quiz in database
        const quizId = await db.createQuiz({
          userId: ctx.user.id,
          topic: input.topic,
          gradeLevel: input.gradeLevel,
          source: "ai",
          metadata: JSON.stringify({ count: input.count }),
        });

        if (!quizId) throw new Error("Failed to create quiz");

        // Create questions
        const questionInserts = questionsData.map((q: any) => ({
          quizId,
          question: q.question,
          questionType: q.type || "mcq",
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.answer,
          explanation: q.explanation,
          points: q.points || 10,
        }));

        await db.createQuestions(questionInserts);

        // Log analytics
        await db.logAnalyticsEvent({
          userId: ctx.user.id,
          eventType: "quiz_generated",
          eventData: JSON.stringify({ topic: input.topic, count: input.count }),
        });

        return { quizId, questions: questionsData };
      }),

    get: protectedProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ ctx, input }) => {
        const quiz = await db.getQuizById(input.quizId);
        if (!quiz || quiz.userId !== ctx.user.id) {
          throw new Error("Quiz not found");
        }
        const questions = await db.getQuizQuestions(input.quizId);
        return { quiz, questions };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserQuizzes(ctx.user.id);
    }),

    // Grade a quiz submission
    grade: protectedProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          answer: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const questions = await db.getQuizQuestions(input.quizId);
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new Error("User not found");

        let score = 0;
        let totalPoints = 0;
        const feedback: any[] = [];

        for (const q of questions) {
          totalPoints += q.points;
          const userAnswer = input.answers.find(a => a.questionId === q.id);
          
          if (!userAnswer) {
            feedback.push({
              questionId: q.id,
              correct: false,
              userAnswer: "",
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: 0,
            });
            continue;
          }

          let isCorrect = false;
          let pointsEarned = 0;

          if (q.questionType === "mcq") {
            isCorrect = userAnswer.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            pointsEarned = isCorrect ? q.points : 0;
          } else if (q.questionType === "short") {
            // Fuzzy matching for short answers
            const similarity = userAnswer.answer.toLowerCase().includes(q.correctAnswer.toLowerCase()) ||
                             q.correctAnswer.toLowerCase().includes(userAnswer.answer.toLowerCase());
            isCorrect = similarity;
            pointsEarned = isCorrect ? q.points : 0;
          } else if (q.questionType === "essay") {
            // For essays, give partial credit based on length and keywords
            const wordCount = userAnswer.answer.split(/\s+/).length;
            pointsEarned = Math.min(q.points, Math.floor(wordCount / 10) * 2);
          }

          score += pointsEarned;
          feedback.push({
            questionId: q.id,
            correct: isCorrect,
            userAnswer: userAnswer.answer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: pointsEarned,
          });
        }

        // Calculate rewards
        const rewards = calculateRewards(score, totalPoints);
        
        // Update user gamification
        const newXp = user.xp + rewards.xp;
        const newCoins = user.coins + rewards.coins;
        const newLevel = calculateLevel(newXp);

        await db.updateUserGamification(ctx.user.id, {
          xp: newXp,
          coins: newCoins,
          level: newLevel,
        });

        // Update leaderboard
        const profile = await db.getStudentProfile(ctx.user.id);
        await db.updateLeaderboard(ctx.user.id, newXp, profile?.county || undefined, profile?.school || undefined);

        // Save result
        const resultId = await db.createResult({
          quizId: input.quizId,
          userId: ctx.user.id,
          score,
          totalPoints,
          xpEarned: rewards.xp,
          coinsEarned: rewards.coins,
          feedback: JSON.stringify(feedback),
        });

        return {
          score,
          totalPoints,
          percentage: (score / totalPoints) * 100,
          xpEarned: rewards.xp,
          coinsEarned: rewards.coins,
          newLevel,
          feedback,
          message: score === totalPoints ? "Perfect! +50 XP bonus! 🎉" : "Nice work! Keep learning! 🔥",
        };
      }),
  }),

  // Mr. T AI Chat
  aiChat: router({
    send: protectedProcedure
      .input(z.object({
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const mrTPersona = `You are Mr. T, a friendly Kenyan tutor who is encouraging, slightly cheeky, and motivational. You help students learn by explaining concepts clearly and giving positive reinforcement. Use phrases like "Nice one!", "You're on fire!", "Keep it up!", and occasionally use Kenyan English expressions. Be warm and supportive.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: mrTPersona },
            { role: "user", content: input.message },
          ],
        });

        const reply = typeof response.choices[0].message.content === 'string'
          ? response.choices[0].message.content
          : "Sorry, I didn't catch that!";

        // Save chat history
        await db.createChat({
          userId: ctx.user.id,
          message: input.message,
          response: reply,
        });

        return { response: reply };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserChats(ctx.user.id);
    }),
  }),

  // Notes management
  notes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotes(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        topic: z.string().optional(),
        gradeLevel: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const noteId = await db.createNote({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          topic: input.topic,
          gradeLevel: input.gradeLevel,
          source: "manual",
        });
        return { noteId };
      }),

    delete: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNote(input.noteId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Leaderboard
  leaderboard: router({
    get: publicProcedure
      .input(z.object({
        county: z.string().optional(),
        school: z.string().optional(),
        limit: z.number().min(1).max(200).default(100),
      }))
      .query(async ({ input }) => {
        return await db.getLeaderboard(input.county, input.school, input.limit);
      }),
  }),

  // Referral system
  referral: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const code = `${ctx.user.name?.slice(0, 3).toUpperCase() || 'TKR'}${randomSuffix().slice(0, 6).toUpperCase()}`;
      
      const referralId = await db.createReferral({
        referrerId: ctx.user.id,
        referralCode: code,
        redeemed: 0,
      });

      return { code, referralId };
    }),

    redeem: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const referral = await db.getReferralByCode(input.code);
        
        if (!referral) {
          throw new Error("Invalid referral code");
        }

        if (referral.redeemed === 1) {
          throw new Error("Referral code already used");
        }

        if (referral.referrerId === ctx.user.id) {
          throw new Error("Cannot use your own referral code");
        }

        // Redeem the referral
        await db.redeemReferral(input.code, ctx.user.id);

        // Reward both users
        const referrer = await db.getUserById(referral.referrerId);
        const referee = await db.getUserById(ctx.user.id);

        if (referrer) {
          await db.updateUserGamification(referrer.id, {
            coins: referrer.coins + 50,
          });
        }

        if (referee) {
          await db.updateUserGamification(referee.id, {
            coins: referee.coins + 50,
          });
        }

        return { success: true, coinsEarned: 50 };
      }),
  }),

  // Classroom management for teachers
  classroom: router({
    create: protectedProcedure
      .input(z.object({ name: z.string(), gradeLevel: z.string(), subject: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const classId = await db.createClassroom(ctx.user.id, input.name, input.gradeLevel, input.subject);
        return { classId, message: "Classroom created successfully!" };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeacherClassrooms(ctx.user.id);
    }),
    
    addStudents: protectedProcedure
      .input(z.object({ classId: z.number(), studentEmails: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        await db.addStudentsToClass(input.classId, input.studentEmails);
        return { success: true, message: `${input.studentEmails.length} students added!` };
      }),
    
    assignQuiz: protectedProcedure
      .input(z.object({ classId: z.number(), quizId: z.number(), dueDate: z.date().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.assignQuizToClass(input.classId, input.quizId, input.dueDate);
        return { success: true, message: "Quiz assigned to class!" };
      }),
    
    getAnalytics: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getClassAnalytics(input.classId);
      }),
  }),

  // Results history
  results: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserResults(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
