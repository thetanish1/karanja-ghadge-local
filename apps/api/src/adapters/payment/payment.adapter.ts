import { PaymentMethod, PaymentStatus } from '@karanjaghadge/shared';
import { PaymentModel } from '../../models/index.js';
import mongoose from 'mongoose';

export interface RecordPaymentParams {
  orderId: string;
  method: PaymentMethod;
  amountPaise: number;
  recordedByUserId?: string;
  providerRef?: string;
}

export class PaymentAdapter {
  /**
   * Records a manual pilot payment (COD or Pay Direct to Shop).
   */
  async recordPayment(params: RecordPaymentParams): Promise<{
    paymentId: string;
    status: PaymentStatus;
    method: PaymentMethod;
    amountPaise: number;
  }> {
    const payment = await PaymentModel.create({
      orderId: new mongoose.Types.ObjectId(params.orderId),
      method: params.method,
      status: 'paid',
      amountPaise: params.amountPaise,
      providerRef: params.providerRef || `manual-${params.method}-${Date.now()}`,
      recordedBy: params.recordedByUserId ? new mongoose.Types.ObjectId(params.recordedByUserId) : undefined,
    });

    return {
      paymentId: payment._id.toString(),
      status: payment.status,
      method: payment.method,
      amountPaise: payment.amountPaise,
    };
  }

  /**
   * UPI Gateway stub for Phase 2 (verifies webhooks and signatures).
   */
  async verifyWebhookSignature(_signature: string, _rawBody: any): Promise<boolean> {
    // UPI gateway integration deferred to Phase 2
    return false;
  }
}

export const paymentAdapter = new PaymentAdapter();
