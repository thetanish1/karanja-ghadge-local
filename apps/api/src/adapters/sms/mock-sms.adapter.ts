export interface SMSAdapterResponse {
  success: boolean;
  status: 'sent' | 'mock' | 'failed';
  providerMessageId: string;
  notes?: string;
}

export interface ISMSAdapter {
  sendOTP(phone: string, otp: string): Promise<SMSAdapterResponse>;
}

export class MockSMSAdapter implements ISMSAdapter {
  async sendOTP(phone: string, otp: string): Promise<SMSAdapterResponse> {
    const timestamp = new Date().toISOString();
    console.log(
      `\n======================================================\n` +
      `[MOCK SMS ADAPTER - DEVELOPMENT ONLY]\n` +
      `Time: ${timestamp}\n` +
      `Recipient: ${phone}\n` +
      `OTP Code: >>> ${otp} <<<\n` +
      `Honest Note: SMS was NOT sent to carrier (DLT / real SMS gateway disabled in pilot).\n` +
      `======================================================\n`
    );

    return {
      success: true,
      status: 'mock',
      providerMessageId: `mock-sms-${Date.now()}`,
      notes: 'Development mock log. Not sent via telecom carrier.',
    };
  }
}

export const smsAdapter = new MockSMSAdapter();
