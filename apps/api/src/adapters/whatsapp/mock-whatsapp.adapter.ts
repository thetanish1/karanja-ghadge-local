import { NotificationModel } from '../../models/index.js';
import mongoose from 'mongoose';

export interface WhatsAppPayload {
  userId: string;
  phone: string;
  template: 'order_placed' | 'shop_accepted' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
  params: Record<string, string | number>;
  fallbackBody: string;
}

export interface WhatsAppAdapterResponse {
  success: boolean;
  status: 'sent' | 'mock' | 'failed';
  providerMessageId: string;
  template: string;
  notes?: string;
}

export interface IWhatsAppAdapter {
  sendTemplateNotification(payload: WhatsAppPayload): Promise<WhatsAppAdapterResponse>;
}

export class MockWhatsAppAdapter implements IWhatsAppAdapter {
  async sendTemplateNotification(payload: WhatsAppPayload): Promise<WhatsAppAdapterResponse> {
    const timestamp = new Date().toISOString();
    const providerMessageId = `mock-wa-${Date.now()}`;

    console.log(
      `\n------------------------------------------------------\n` +
      `[MOCK WHATSAPP ADAPTER - HONEST LOG]\n` +
      `Time: ${timestamp}\n` +
      `To: ${payload.phone} (UserId: ${payload.userId})\n` +
      `Template: ${payload.template}\n` +
      `Params: ${JSON.stringify(payload.params)}\n` +
      `Body: "${payload.fallbackBody}"\n` +
      `Status: NOT SENT (Official WhatsApp Business API deferred for Pilot)\n` +
      `------------------------------------------------------\n`
    );

    // Persist as an in-app / mock notification audit
    try {
      if (mongoose.Types.ObjectId.isValid(payload.userId)) {
        await NotificationModel.create({
          userId: new mongoose.Types.ObjectId(payload.userId),
          channel: 'whatsapp_mock',
          template: payload.template,
          title: `WhatsApp Alert: ${payload.template.replace(/_/g, ' ').toUpperCase()}`,
          body: payload.fallbackBody,
          providerMessageId,
          status: 'mock',
          read: false,
        });
      }
    } catch (err) {
      console.warn('[MockWhatsAppAdapter] Could not persist notification record:', err);
    }

    return {
      success: true,
      status: 'mock',
      providerMessageId,
      template: payload.template,
      notes: 'Development mock logged. Real WhatsApp message NOT sent.',
    };
  }
}

export const whatsAppAdapter = new MockWhatsAppAdapter();
