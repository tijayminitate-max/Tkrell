/**
 * Payment Router - Handles M-Pesa and premium tier management
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { mpesa, generateTransactionRef, formatPhoneForMpesa } from "./mpesa";
import * as db from "./db";

export const paymentRouter = router({
  /**
   * Initiate M-Pesa STK Push for premium subscription
   */
  initiateMpesaPayment: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        tier: z.enum(["premium", "vip"]),
        amount: z.number().min(100).max(100000), // KSH
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const transactionRef = generateTransactionRef(ctx.user.id, input.tier);
        const formattedPhone = formatPhoneForMpesa(input.phoneNumber);

        // Store pending transaction
        await db.createPendingTransaction({
          userId: ctx.user.id,
          transactionRef,
          amount: input.amount,
          tier: input.tier,
          phoneNumber: formattedPhone,
          status: "pending",
        });

        // Initiate STK Push
        const result = await mpesa.stkPush({
          phoneNumber: formattedPhone,
          amount: input.amount,
          accountReference: transactionRef,
          transactionDesc: `Tkrell ${input.tier} subscription`,
          callbackUrl: `${process.env.APP_URL}/api/mpesa/callback`,
        });

        return {
          success: result.ResponseCode === "0",
          checkoutRequestId: result.CheckoutRequestID,
          merchantRequestId: result.MerchantRequestID,
          message: result.CustomerMessage,
        };
      } catch (error) {
        console.error("M-Pesa payment initiation failed:", error);
        throw new Error("Failed to initiate payment. Please try again.");
      }
    }),

  /**
   * Check payment status
   */
  checkPaymentStatus: protectedProcedure
    .input(
      z.object({
        checkoutRequestId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await mpesa.querySTKStatus(input.checkoutRequestId);

        return {
          success: result.ResultCode === "0",
          status: result.ResultDesc,
          resultCode: result.ResultCode,
        };
      } catch (error) {
        console.error("Payment status check failed:", error);
        throw new Error("Failed to check payment status");
      }
    }),

  /**
   * Get user's subscription status
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);

    if (!subscription) {
      return {
        tier: "free",
        status: "active",
        expiresAt: null,
        daysRemaining: null,
      };
    }

    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      tier: subscription.tier,
      status: expiresAt > now ? "active" : "expired",
      expiresAt: expiresAt.toISOString(),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    await db.cancelUserSubscription(ctx.user.id);
    return { success: true };
  }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await db.getUserTransactions(ctx.user.id);
    return transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      tier: t.tier,
      status: t.status,
      transactionRef: t.transactionRef,
      createdAt: t.createdAt,
    }));
  }),

  /**
   * M-Pesa Callback Handler (called by M-Pesa)
   * This is handled separately in the API routes
   */
});

/**
 * M-Pesa Callback Handler
 * This should be called from your API route: /api/mpesa/callback
 */
export async function handleMpesaCallback(body: any) {
  try {
    const result = body.Body.stkCallback;

    if (result.ResultCode === 0) {
      // Payment successful
      const metadata = result.CallbackMetadata.Item;
      const transactionRef = metadata.find((item: any) => item.Name === "AccountReference")?.Value;
      const mpesaCode = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;

      // Update transaction status
      await db.updateTransactionStatus(transactionRef, "completed", mpesaCode);

      // Get transaction details
      const transaction = await db.getTransactionByRef(transactionRef);

      if (transaction && transaction.userId) {
        // Activate subscription
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

        await db.createOrUpdateSubscription({
          userId: transaction.userId as number,
          tier: transaction.tier as "premium" | "vip",
          expiresAt,
          transactionId: transaction.id as number,
        });

        console.log(`Subscription activated for user ${transaction.userId}`);
      }
    } else {
      // Payment failed
      const transactionRef = result.CheckoutRequestID;
      await db.updateTransactionStatus(transactionRef, "failed");
    }

    return { success: true };
  } catch (error) {
    console.error("M-Pesa callback processing failed:", error);
    throw error;
  }
}
