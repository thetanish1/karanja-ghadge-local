import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { SettingModel } from '../../models/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { DEFAULT_SETTINGS } from '@karanjaghadge/shared';
import { logAudit } from '../../middleware/audit.js';

const router = Router();

// Public: Get effective settings
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await SettingModel.find();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    res.json({
      success: true,
      settings: settingsMap,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Get all settings with metadata
router.get('/admin', authenticate, requireRoles('admin'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await SettingModel.find().populate('updatedBy', 'name phone');
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});

// Admin: Update setting
router.put('/', authenticate, requireRoles('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key, value, description } = z
      .object({
        key: z.string().min(1),
        value: z.any(),
        description: z.string().optional(),
      })
      .parse(req.body);

    const existing = await SettingModel.findOne({ key });
    const beforeValue = existing?.value;

    const setting = await SettingModel.findOneAndUpdate(
      { key },
      {
        value,
        description: description || existing?.description,
        updatedBy: new mongoose.Types.ObjectId(req.user!.id),
      },
      { upsert: true, new: true }
    );

    await logAudit({
      actorId: req.user!.id,
      actorRole: 'admin',
      action: 'SETTING_UPDATED',
      target: 'Setting',
      targetId: key,
      before: { value: beforeValue },
      after: { value },
    });

    res.json({
      success: true,
      message: `Setting ${key} updated`,
      setting,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
