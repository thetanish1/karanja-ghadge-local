import { AuditLogModel } from '../models/index.js';
import mongoose from 'mongoose';

export interface AuditActionParams {
  actorId: string;
  actorRole?: string;
  action: string;
  target: string;
  targetId?: string;
  before?: any;
  after?: any;
  ip?: string;
}

export async function logAudit(params: AuditActionParams): Promise<void> {
  try {
    await AuditLogModel.create({
      actorId: new mongoose.Types.ObjectId(params.actorId),
      actorRole: params.actorRole,
      action: params.action,
      target: params.target,
      targetId: params.targetId,
      before: params.before,
      after: params.after,
      ip: params.ip,
      at: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
