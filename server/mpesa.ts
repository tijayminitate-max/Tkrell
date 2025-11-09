/**
 * M-Pesa Daraja API Integration
 * Handles payment processing for Kenyan users
 * 
 * Setup:
 * 1. Go to https://developer.safaricom.co.ke/
 * 2. Create account and register app
 * 3. Get Consumer Key and Consumer Secret
 * 4. Add to .env:
 *    MPESA_CONSUMER_KEY=your_key
 *    MPESA_CONSUMER_SECRET=your_secret
 *    MPESA_SHORTCODE=your_shortcode
 *    MPESA_PASSKEY=your_passkey
 */

import axios from 'axios';
import crypto from 'crypto';

// M-Pesa API endpoints
const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const MPESA_QUERY_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
const MPESA_C2B_REGISTER_URL = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl';
const MPESA_C2B_SIMULATE_URL = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate';

// Production URLs (uncomment when ready)
// const MPESA_AUTH_URL = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
// const MPESA_STK_PUSH_URL = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
// const MPESA_QUERY_URL = 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackUrl: string;
}

interface STKPushRequest {
  phoneNumber: string; // Format: 254XXXXXXXXX
  amount: number; // In KSH
  accountReference: string; // Order ID or user ID
  transactionDesc: string; // Description
  callbackUrl: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface STKQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

interface C2BPayment {
  transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
  phone: string;
  amount: number;
  billRefNumber: string;
}

class MpesaClient {
  private config: MpesaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MpesaConfig) {
    this.config = config;
  }

  /**
   * Get access token from M-Pesa OAuth
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(MPESA_AUTH_URL, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      this.accessToken = response.data.access_token;
      // Token expires in 3600 seconds, refresh after 3500 seconds
      this.tokenExpiry = Date.now() + 3500000;

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get M-Pesa access token:', error);
      throw new Error('M-Pesa authentication failed');
    }
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   * Shows payment prompt on user's phone
   */
  async stkPush(request: STKPushRequest): Promise<STKPushResponse> {
    const token = await this.getAccessToken();

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, '')
      .split('.')[0];

    // Generate password: Base64(ShortCode + PassKey + Timestamp)
    const password = Buffer.from(
      `${this.config.shortCode}${this.config.passKey}${timestamp}`
    ).toString('base64');

    // Format phone number: remove leading 0 or +, add 254
    let formattedPhone = request.phoneNumber;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    try {
      const response = await axios.post(
        MPESA_STK_PUSH_URL,
        {
          BusinessShortCode: this.config.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.floor(request.amount), // Must be integer
          PartyA: formattedPhone,
          PartyB: this.config.shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: request.callbackUrl,
          AccountReference: request.accountReference,
          TransactionDesc: request.transactionDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('STK Push failed:', error);
      throw error;
    }
  }

  /**
   * Query STK Push status
   * Check if user completed payment
   */
  async querySTKStatus(
    checkoutRequestId: string
  ): Promise<STKQueryResponse> {
    const token = await this.getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, '')
      .split('.')[0];

    const password = Buffer.from(
      `${this.config.shortCode}${this.config.passKey}${timestamp}`
    ).toString('base64');

    try {
      const response = await axios.post(
        MPESA_QUERY_URL,
        {
          BusinessShortCode: this.config.shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('STK Query failed:', error);
      throw error;
    }
  }

  /**
   * Register C2B URLs for receiving payments
   */
  async registerC2BUrl(
    confirmationUrl: string,
    validationUrl: string
  ): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        MPESA_C2B_REGISTER_URL,
        {
          ShortCode: this.config.shortCode,
          ResponseType: 'Completed',
          ConfirmationURL: confirmationUrl,
          ValidationURL: validationUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('C2B registration failed:', error);
      throw error;
    }
  }

  /**
   * Simulate C2B payment (for testing)
   */
  async simulateC2BPayment(payment: C2BPayment): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        MPESA_C2B_SIMULATE_URL,
        {
          ShortCode: this.config.shortCode,
          CommandID: payment.transactionType,
          Amount: Math.floor(payment.amount),
          Msisdn: payment.phone,
          BillRefNumber: payment.billRefNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('C2B simulation failed:', error);
      throw error;
    }
  }
}

// Initialize M-Pesa client
export function initializeMpesa(): MpesaClient {
  const config: MpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortCode: process.env.MPESA_SHORTCODE || '',
    passKey: process.env.MPESA_PASSKEY || '',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
  };

  if (!config.consumerKey || !config.consumerSecret) {
    console.warn('M-Pesa credentials not configured');
  }

  return new MpesaClient(config);
}

export const mpesa = initializeMpesa();

/**
 * Helper to validate M-Pesa callback signature
 */
export function validateMpesaCallback(
  signature: string,
  body: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * Helper to generate M-Pesa transaction reference
 */
export function generateTransactionRef(userId: number, tier: string): string {
  return `TKR${userId}${tier.toUpperCase()}${Date.now()}`;
}

/**
 * Helper to format phone number for M-Pesa
 */
export function formatPhoneForMpesa(phone: string): string {
  let formatted = phone.trim();
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (!formatted.startsWith('254')) {
    formatted = '254' + formatted;
  }
  return formatted;
}
