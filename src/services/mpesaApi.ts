// M-Pesa API Service for Real Transactions
// Note: This requires valid M-Pesa API credentials from Safaricom

interface MpesaTransactionRequest {
  phoneNumber: string;
  amount: number;
  transactionType: 'send' | 'deposit' | 'withdraw';
  description?: string;
  accountReference?: string;
}

interface MpesaResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}

class MpesaApiService {
  private consumerKey: string;
  private consumerSecret: string;
  private passKey: string;
  private businessShortCode: string;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    // These should be stored in environment variables
    this.consumerKey = process.env.REACT_APP_MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.REACT_APP_MPESA_CONSUMER_SECRET || '';
    this.passKey = process.env.REACT_APP_MPESA_PASS_KEY || '';
    this.businessShortCode = process.env.REACT_APP_MPESA_BUSINESS_SHORTCODE || '';
    this.baseUrl = process.env.REACT_APP_MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  // Get OAuth Access Token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Token expires in 1 hour, implement refresh logic
      setTimeout(() => {
        this.accessToken = null;
      }, 3600000);

      return this.accessToken!;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  // Initiate STK Push for real money transaction
  async initiateTransaction(request: MpesaTransactionRequest): Promise<MpesaResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.businessShortCode}${this.passKey}${timestamp}`).toString('base64');

      const stkPushRequest = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline', // For send money
        Amount: request.amount,
        PartyA: request.phoneNumber, // Sender's phone
        PartyB: this.businessShortCode, // Business number
        PhoneNumber: request.phoneNumber, // Number to receive STK prompt
        CallBackURL: `${window.location.origin}/api/mpesa/callback`,
        AccountReference: request.accountReference || 'JdanAgencies',
        TransactionDesc: request.description || `${request.transactionType} transaction`,
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushRequest),
      });

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          transactionId: data.CheckoutRequestID,
          message: 'STK Push sent successfully. Please check your phone.',
        };
      } else {
        return {
          success: false,
          message: data.errorMessage || 'Failed to initiate transaction',
          errorCode: data.ResponseCode,
        };
      }
    } catch (error) {
      console.error('M-Pesa transaction error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  // Check transaction status
  async checkTransactionStatus(checkoutRequestID: string): Promise<MpesaResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.businessShortCode}${this.passKey}${timestamp}`).toString('base64');

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: this.businessShortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestID,
        }),
      });

      const data = await response.json();

      if (data.ResultCode === '0') {
        return {
          success: true,
          transactionId: data.CheckoutRequestID,
          message: 'Transaction completed successfully',
        };
      } else {
        return {
          success: false,
          message: data.ResultDesc || 'Transaction failed',
          errorCode: data.ResultCode,
        };
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return {
        success: false,
        message: 'Failed to check transaction status',
      };
    }
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Kenyan number (starts with 2547 and has 12 digits)
    return /^2547[0-9]{8}$/.test(cleanPhone);
  }

  // Format phone number for M-Pesa
  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('254')) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('07')) {
      return `254${cleanPhone.substring(1)}`;
    } else if (cleanPhone.startsWith('7')) {
      return `254${cleanPhone}`;
    }
    
    return cleanPhone;
  }
}

export default MpesaApiService;
