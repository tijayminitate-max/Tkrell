import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../_core/db";
import { conversations, messages, users } from "../../drizzle/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

export const chatRouter = router({
  // Get all conversations for current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userConversations = await db
      .select({
        id: conversations.id,
        participant1Id: conversations.participant1Id,
        participant2Id: conversations.participant2Id,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, ctx.user.id),
          eq(conversations.participant2Id, ctx.user.id)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Get other participant details for each conversation
    const conversationsWithUsers = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId =
          conv.participant1Id === ctx.user.id
            ? conv.participant2Id
            : conv.participant1Id;

        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, otherUserId));

        return {
          ...conv,
          otherUser,
        };
      })
    );

    return conversationsWithUsers;
  }),

  // Get or create conversation with another user
  getOrCreateConversation: protectedProcedure
    .input(z.object({ otherUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if conversation already exists
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          or(
            and(
              eq(conversations.participant1Id, ctx.user.id),
              eq(conversations.participant2Id, input.otherUserId)
            ),
            and(
              eq(conversations.participant1Id, input.otherUserId),
              eq(conversations.participant2Id, ctx.user.id)
            )
          )
        );

      if (existing) {
        return existing;
      }

      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          participant1Id: ctx.user.id,
          participant2Id: input.otherUserId,
        })
        .returning();

      return newConversation;
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId));

      if (
        !conversation ||
        (conversation.participant1Id !== ctx.user.id &&
          conversation.participant2Id !== ctx.user.id)
      ) {
        throw new Error("Conversation not found or access denied");
      }

      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          fileUrl: messages.fileUrl,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderName: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return conversationMessages.reverse(); // Show oldest first
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1),
        messageType: z.enum(["text", "file", "image"]).default("text"),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId));

      if (
        !conversation ||
        (conversation.participant1Id !== ctx.user.id &&
          conversation.participant2Id !== ctx.user.id)
      ) {
        throw new Error("Conversation not found or access denied");
      }

      // Create message
      const [message] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          messageType: input.messageType,
          fileUrl: input.fileUrl,
        })
        .returning();

      // Update conversation's last message timestamp
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return message;
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({ messageIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            sql`${messages.id} = ANY(${input.messageIds})`,
            sql`${messages.senderId} != ${ctx.user.id}` // Don't mark own messages as read
          )
        );

      return { success: true };
    }),

  // Get class messages
  getClassMessages: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const classMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          messageType: messages.messageType,
          fileUrl: messages.fileUrl,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderName: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.classId, input.classId))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return classMessages.reverse();
    }),

  // Send class message
  sendClassMessage: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        content: z.string().min(1),
        messageType: z.enum(["text", "file", "image"]).default("text"),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify user is enrolled in class or is the teacher

      const [message] = await db
        .insert(messages)
        .values({
          classId: input.classId,
          senderId: ctx.user.id,
          content: input.content,
          messageType: input.messageType,
          fileUrl: input.fileUrl,
        })
        .returning();

      return message;
    }),

  // Search users to start conversation
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const foundUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(
          and(
            sql`${users.id} != ${ctx.user.id}`, // Exclude current user
            or(
              sql`${users.name} ILIKE ${`%${input.query}%`}`,
              sql`${users.email} ILIKE ${`%${input.query}%`}`
            )
          )
        )
        .limit(10);

      return foundUsers;
    }),
});
