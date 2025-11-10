import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../_core/db";
import { uploads, likes } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const uploadsRouter = router({
  // Create a new upload
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        fileUrl: z.string().url(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        subject: z.string().optional(),
        topic: z.string().optional(),
        gradeLevel: z.string().optional(),
        visibility: z.enum(["public", "private", "class"]).default("private"),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [upload] = await db
        .insert(uploads)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();

      return upload;
    }),

  // Get user's own uploads
  getMyUploads: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, ctx.user.id))
      .orderBy(desc(uploads.createdAt));
  }),

  // Get public uploads with filters
  getPublicUploads: protectedProcedure
    .input(
      z.object({
        subject: z.string().optional(),
        gradeLevel: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      let query = db
        .select()
        .from(uploads)
        .where(eq(uploads.visibility, "public"))
        .orderBy(desc(uploads.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Apply filters if provided
      // Note: This is a simplified version. For production, use proper query building
      return await query;
    }),

  // Get single upload by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [upload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, input.id));

      if (!upload) {
        throw new Error("Upload not found");
      }

      // Check if user has permission to view
      if (
        upload.visibility === "private" &&
        upload.userId !== ctx.user.id
      ) {
        throw new Error("You don't have permission to view this upload");
      }

      // Increment view count
      await db
        .update(uploads)
        .set({ views: sql`${uploads.views} + 1` })
        .where(eq(uploads.id, input.id));

      return upload;
    }),

  // Update upload
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        subject: z.string().optional(),
        topic: z.string().optional(),
        gradeLevel: z.string().optional(),
        visibility: z.enum(["public", "private", "class"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const [upload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, id));

      if (!upload || upload.userId !== ctx.user.id) {
        throw new Error("Upload not found or you don't have permission");
      }

      const [updated] = await db
        .update(uploads)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(uploads.id, id))
        .returning();

      return updated;
    }),

  // Delete upload
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const [upload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, input.id));

      if (!upload || upload.userId !== ctx.user.id) {
        throw new Error("Upload not found or you don't have permission");
      }

      await db.delete(uploads).where(eq(uploads.id, input.id));

      return { success: true };
    }),

  // Like/unlike upload
  toggleLike: protectedProcedure
    .input(z.object({ uploadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already liked
      const [existingLike] = await db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.userId, ctx.user.id),
            eq(likes.uploadId, input.uploadId)
          )
        );

      if (existingLike) {
        // Unlike
        await db
          .delete(likes)
          .where(eq(likes.id, existingLike.id));

        await db
          .update(uploads)
          .set({ likes: sql`${uploads.likes} - 1` })
          .where(eq(uploads.id, input.uploadId));

        return { liked: false };
      } else {
        // Like
        await db.insert(likes).values({
          userId: ctx.user.id,
          uploadId: input.uploadId,
        });

        await db
          .update(uploads)
          .set({ likes: sql`${uploads.likes} + 1` })
          .where(eq(uploads.id, input.uploadId));

        return { liked: true };
      }
    }),

  // Increment download count
  incrementDownload: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(uploads)
        .set({ downloads: sql`${uploads.downloads} + 1` })
        .where(eq(uploads.id, input.id));

      return { success: true };
    }),
});
