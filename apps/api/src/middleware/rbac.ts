import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { UserRole } from '@karanjaghadge/shared';
import { ShopMembershipModel, ShopModel } from '../models/index.js';
import mongoose from 'mongoose';

/**
 * Enforces that user has at least one of the required roles (or is admin).
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });
      return;
    }

    const hasRole = req.user.roles.some(
      (role) => allowedRoles.includes(role) || role === 'admin'
    );

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Action requires one of roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
}

/**
 * IDOR Defense: Verifies that the authenticated user owns or is a member of the shop.
 * Admins are automatically permitted.
 */
export function requireShopAccess(shopIdParamName: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (req.user.roles.includes('admin')) {
      return next();
    }

    const shopId = req.params[shopIdParamName] || req.body.shopId;
    if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
      res.status(400).json({ success: false, error: 'Invalid or missing shop ID.' });
      return;
    }

    // Check if user is the direct owner or a verified shop member
    const [shop, membership] = await Promise.all([
      ShopModel.findOne({ _id: shopId, ownerId: req.user.id }),
      ShopMembershipModel.findOne({ shopId, userId: req.user.id }),
    ]);

    if (!shop && !membership) {
      res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permissions to manage this shop.',
      });
      return;
    }

    next();
  };
}
