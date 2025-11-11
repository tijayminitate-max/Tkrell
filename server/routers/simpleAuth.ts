import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

export const simpleAuthRouter = router({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        throw new Error("Email already registered");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user with email as openId
      const openId = `email_${input.email}`;
      await db.upsertUser({
        openId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Create session
      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, message: "Registration successful!" };
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user by email
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.password) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, user.password || "");
      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, message: "Login successful!" };
    }),
});
