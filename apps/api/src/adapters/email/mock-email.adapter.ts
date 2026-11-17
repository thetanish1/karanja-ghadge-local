export interface EmailOptions {
  to: string;
  subject: string;
  template: 'shop_verification_received' | 'shop_approved' | 'shop_rejected' | 'order_confirmation';
  data: {
    shopName?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    openTime?: string;
    closeTime?: string;
    orderId?: string;
    totalAmount?: string;
    [key: string]: any;
  };
}

export interface EmailAdapterResponse {
  success: boolean;
  status: 'sent' | 'mock' | 'failed';
  providerMessageId: string;
  timestamp: string;
  previewContent: string;
  notes: string;
}

export interface IEmailAdapter {
  sendEmail(options: EmailOptions): Promise<EmailAdapterResponse>;
}

export class MockEmailAdapter implements IEmailAdapter {
  private sentEmails: Array<EmailOptions & { sentAt: string; messageId: string }> = [];

  async sendEmail(options: EmailOptions): Promise<EmailAdapterResponse> {
    const timestamp = new Date().toISOString();
    const messageId = `mock-email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let previewContent = '';

    if (options.template === 'shop_verification_received') {
      previewContent = 
`Subject: [AapnaCart Karanja] Your Shop Application is Under Verification
To: ${options.to}

Dear ${options.data.ownerName || 'Shopkeeper'},

Thank you for registering "${options.data.shopName || 'Your Store'}" on AapnaCart (Karanja Ghadge Local)!

Your merchant onboarding request has been submitted to the local admin team for document & location verification.
Application Summary:
• Shop Name: ${options.data.shopName}
• Location: ${options.data.address || 'Karanja Ghadge'}
• Contact: +91 ${options.data.phone}
• Operating Hours: ${options.data.openTime || '08:00 AM'} - ${options.data.closeTime || '09:00 PM'}
• Current Status: UNDER VERIFICATION (2-4 business hours)

Once verified by our Karanja admin, your catalog will go live and town residents can start placing orders.

Warm regards,
Team Karanja (Ghadge) Local / AapnaCart`;
    } else {
      previewContent = 
`Subject: ${options.subject}
To: ${options.to}
Message: ${JSON.stringify(options.data, null, 2)}`;
    }

    console.log(
      `\n======================================================\n` +
      `[MOCK EMAIL ADAPTER - DISPATCH NOTIFICATION]\n` +
      `Message ID: ${messageId}\n` +
      `Sent At: ${timestamp}\n` +
      `Recipient: ${options.to}\n` +
      `Subject: ${options.subject}\n` +
      `------------------------------------------------------\n` +
      previewContent + `\n` +
      `======================================================\n`
    );

    this.sentEmails.push({
      ...options,
      sentAt: timestamp,
      messageId,
    });

    return {
      success: true,
      status: 'mock',
      providerMessageId: messageId,
      timestamp,
      previewContent,
      notes: 'Development mock log. Email verified and simulated in console.',
    };
  }

  getSentEmails() {
    return [...this.sentEmails];
  }
}

export const emailAdapter = new MockEmailAdapter();
