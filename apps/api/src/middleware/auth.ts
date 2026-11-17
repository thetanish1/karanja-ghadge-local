import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserModel, IUser } from '../models/index.js';
import { UserRole } from '@karanjaghadge/shared';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    roles: UserRole[];
    name: string;
  };
}

export function generateTokens(user: IUser) {
  const payload = {
    id: user._id.toString(),
    phone: user.phone,
    roles: user.roles,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(
    { id: payload.id, jti: Math.random().toString(36).substring(2) + Date.now().toString(36) },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      phone: string;
      roles: UserRole[];
      name: string;
    };

    const user = await UserModel.findById(decoded.id).select('status roles name phone');
    if (!user || user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'Account is suspended or not found.' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      phone: user.phone,
      roles: user.roles,
      name: user.name,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired access token.' });
  }
}
