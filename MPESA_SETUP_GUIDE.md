# M-Pesa Integration Setup Guide

## Complete Guide to Accept Payments in KSH

This guide will help you set up M-Pesa payments for Tkrell so you can charge students in Kenyan Shillings (KSH).

---

## STEP 1: Create Safaricom Developer Account

1. Go to https://developer.safaricom.co.ke/
2. Click "Sign Up" or "Create Account"
3. Fill in your details:
   - Email address
   - Password
   - Phone number (Kenyan number)
   - Business name: "Tkrell"
4. Verify your email
5. Log in to your account

---

## STEP 2: Register Your Application

1. In the developer portal, click "Create New App"
2. Fill in the form:
   - **App Name:** Tkrell
   - **App Description:** AI-powered education platform for Kenyan students
   - **App Type:** Web Application
3. Click "Create"
4. You'll see your **Consumer Key** and **Consumer Secret**
5. **SAVE THESE** - you'll need them in the next step

---

## STEP 3: Get M-Pesa Credentials

### For Testing (Sandbox - FREE)

Use these test credentials:
- **Consumer Key:** (from Step 2)
- **Consumer Secret:** (from Step 2)
- **Business Short Code:** 174379 (test code)
- **Pass Key:** bfb279f9aa9bdbcf158e97dd71a467cd2e0ff47f3c3b6e989a8eadb5be8f031e (test key)
- **Environment:** Sandbox (for testing)

### For Production (Live - After Testing)

1. Contact Safaricom Business Support
2. Apply for M-Pesa Online API
3. Provide:
   - Business registration documents
   - Identification documents
   - Business bank account details
4. Safaricom will provide:
   - **Production Short Code** (your business code)
   - **Production Pass Key** (your secret key)

---

## STEP 4: Add Environment Variables

### In Your `.env` File

Add these variables to your `.env` file:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_from_step2
MPESA_CONSUMER_SECRET=your_consumer_secret_from_step2
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0ff47f3c3b6e989a8eadb5be8f031e
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

# For production, change to:
# MPESA_SHORTCODE=your_production_shortcode
# MPESA_PASSKEY=your_production_passkey
```

Replace:
- `your_consumer_key_from_step2` - Your Consumer Key
- `your_consumer_secret_from_step2` - Your Consumer Secret
- `your-domain.com` - Your actual domain (e.g., tkrell.com)

---

## STEP 5: Create M-Pesa Callback Handler

The callback handler is already created at `server/payment_routers.ts`, but you need to create an API route to receive M-Pesa callbacks.

### Create `/server/_core/mpesa-callback.ts`

```typescript
import { handleMpesaCallback } from '../payment_routers';

export async function handleMpesaWebhook(body: any) {
  try {
    await handleMpesaCallback(body);
    return { success: true };
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Register Callback URL in Safaricom Portal

1. Go to Safaricom Developer Portal
2. Find your app
3. Under "API Endpoints", set:
   - **Callback URL:** `https://your-domain.com/api/mpesa/callback`
4. Save

---

## STEP 6: Test M-Pesa Integration

### Using Sandbox (Testing)

1. Use test phone number: `254708374149` (provided by Safaricom)
2. In your app, go to Premium Tier
3. Enter test phone number
4. Amount: 1 KSH (minimum)
5. Click "Pay with M-Pesa"
6. You should see STK prompt on test phone
7. Enter PIN: `1234` (test PIN)
8. Payment should complete

### Check Transaction Status

```bash
# In your app, check if payment was successful
curl https://your-domain.com/api/trpc/payment.checkPaymentStatus?checkoutRequestId=YOUR_CHECKOUT_ID
```

---

## STEP 7: Set Up Pricing in Tkrell

### Update Premium Tiers

Edit `client/src/pages/Dashboard.tsx` to set KSH prices:

```typescript
const premiumTiers = [
  {
    name: "Premium",
    price: 499, // KSH per month
    features: [
      "Unlimited quizzes",
      "Ad-free experience",
      "Advanced analytics"
    ]
  },
  {
    name: "VIP",
    price: 999, // KSH per month
    features: [
      "Everything in Premium",
      "Priority tutor support",
      "Exclusive content"
    ]
  }
];
```

---

## STEP 8: Deploy to Production

### Update Environment Variables

When deploying to Vercel/Railway:

1. Go to your deployment platform settings
2. Add these environment variables:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_SHORTCODE`
   - `MPESA_PASSKEY`
   - `MPESA_CALLBACK_URL`
   - `APP_URL` (your production URL)

3. Redeploy your app

### Switch to Production Credentials

Once Safaricom approves your production credentials:

1. Update `.env` with production values
2. Change `MPESA_SHORTCODE` to your production code
3. Change `MPESA_PASSKEY` to your production key
4. Redeploy

---

## STEP 9: Monitor Payments

### View Payment History

In your app dashboard, you can:
- See all transactions
- Check payment status
- View subscription details
- Cancel subscriptions

### Track Revenue

The database stores all transactions:
- Transaction ID
- Amount (KSH)
- Status (pending/completed/failed)
- Timestamp
- User ID

---

## TROUBLESHOOTING

### "M-Pesa authentication failed"

- Check Consumer Key and Secret are correct
- Verify they're in the `.env` file
- Restart your server

### "STK Push failed"

- Verify phone number format (254XXXXXXXXX)
- Check amount is between 1-100,000 KSH
- Verify callback URL is correct

### "Payment not completing"

- Check if callback URL is accessible
- Verify firewall allows M-Pesa servers
- Check server logs for errors

### "Transaction not updating"

- Verify database connection
- Check if transaction table exists
- Review callback handler logs

---

## PRICING RECOMMENDATIONS FOR KENYA

Based on market research:

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| Free | 0 KSH | Students trying | 3 quizzes/day, basic gamification |
| Premium | 499 KSH/month | Regular students | Unlimited quizzes, ad-free, analytics |
| VIP | 999 KSH/month | Serious students | Premium + priority support + exclusive content |
| Teacher | 1,999 KSH/month | Teachers | Class management, student analytics, bulk assign |
| School | 500 KSH/student/month | Schools | Bulk licenses, teacher dashboard, analytics |

---

## PAYMENT FLOW DIAGRAM

```
User clicks "Upgrade to Premium"
    ↓
Enters phone number + selects tier
    ↓
App calls trpc.payment.initiateMpesaPayment
    ↓
Server creates pending transaction
    ↓
Server calls M-Pesa STK Push API
    ↓
STK prompt appears on user's phone
    ↓
User enters M-Pesa PIN
    ↓
M-Pesa processes payment
    ↓
M-Pesa sends callback to your server
    ↓
Server updates transaction status
    ↓
Server activates subscription
    ↓
User sees "Premium activated" message
```

---

## NEXT STEPS

1. ✅ Set up Safaricom developer account
2. ✅ Get Consumer Key and Secret
3. ✅ Add environment variables
4. ✅ Test with sandbox credentials
5. ✅ Apply for production credentials
6. ✅ Switch to production when approved
7. ✅ Monitor transactions and revenue
8. ✅ Scale pricing based on market demand

---

## SUPPORT

For M-Pesa API support:
- Email: developer@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/
- Documentation: https://developer.safaricom.co.ke/docs

For Tkrell support:
- Check server logs
- Review callback handler
- Verify all environment variables are set
