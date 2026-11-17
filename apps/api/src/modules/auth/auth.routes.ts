import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/index.js';
import { smsAdapter } from '../../adapters/sms/mock-sms.adapter.js';
import { generateTokens, authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { config } from '../../config/index.js';
import { AUTH_CONSTANTS } from '@karanjaghadge/shared';

const router = Router();

const requestOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  name: z.string().optional(),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
});

// Request OTP (Public)
router.post('/otp/request', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, name } = requestOtpSchema.parse(req.body);

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000);

    let user = await UserModel.findOne({ phone });
    if (!user) {
      user = new UserModel({
        phone,
        name: name || '',
        roles: ['customer'],
        status: 'active',
      });
    }

    user.otpHash = otp; // In production this would be bcrypt hash; mock for pilot
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    if (name && !user.name) {
      user.name = name;
    }
    await user.save();

    // Call honest mock SMS adapter
    const smsResult = await smsAdapter.sendOTP(phone, otp);

    res.json({
      success: true,
      message: 'OTP generated. Check console log for mock OTP.',
      status: smsResult.status,
      // For development ease, include otp in response unless production
      ...(config.env !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (err) {
    next(err);
  }
});

// Verify OTP (Public)
router.post('/otp/verify', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp, name } = verifyOtpSchema.parse(req.body);

    const user = await UserModel.findOne({ phone });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found. Please request OTP first.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'Account is suspended.' });
      return;
    }

    // Check attempts limit
    if ((user.otpAttempts || 0) >= AUTH_CONSTANTS.MAX_OTP_ATTEMPTS) {
      res.status(429).json({
        success: false,
        error: 'Too many incorrect attempts. Please request a new OTP.',
      });
      return;
    }

    // Check expiry
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Check OTP match
    if (user.otpHash !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      res.status(400).json({
        success: false,
        error: 'Invalid OTP code. Please try again.',
        attemptsRemaining: AUTH_CONSTANTS.MAX_OTP_ATTEMPTS - user.otpAttempts,
      });
      return;
    }

    // Reset OTP and save name if provided
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    if (name && (!user.name || user.name.trim() === '')) {
      user.name = name;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = refreshToken;
    await user.save();

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Sign in successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        roles: user.roles,
        status: user.status,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'Refresh token missing.' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };
    const user = await UserModel.findById(decoded.id);

    if (!user || user.refreshTokenHash !== refreshToken || user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'Invalid or reused refresh token.' });
      return;
    }

    // Rotate refresh token
    const tokens = generateTokens(user);
    user.refreshTokenHash = tokens.refreshToken;
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await UserModel.findByIdAndUpdate(req.user.id, { refreshTokenHash: undefined });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// Get current profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user!.id).select('-otpHash -refreshTokenHash');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        roles: user.roles,
        status: user.status,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
