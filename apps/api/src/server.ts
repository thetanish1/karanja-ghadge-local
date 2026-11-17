import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { connectDB } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import shopRoutes from './modules/shops/shops.routes.js';
import productRoutes from './modules/products/products.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import deliveryRoutes from './modules/delivery/delivery.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import settingRoutes from './modules/settings/settings.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';

export const app = express();

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for local development & PWA assets
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Allowlist
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In dev or localhost, allow all localhost ports
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      if (origin === config.corsOrigin) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local pilot testing
    },
    credentials: true,
  })
);

// Rate Limiting (Applied to Auth endpoints to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health & Observability endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'Karanjaghadge Local API',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.env,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// API Routes (Prefix /api/v1)
const apiV1 = express.Router();

apiV1.use('/auth', authLimiter, authRoutes);
apiV1.use('/shops', shopRoutes);
apiV1.use('/products', productRoutes);
apiV1.use('/cart', cartRoutes);
apiV1.use('/orders', orderRoutes);
apiV1.use('/delivery', deliveryRoutes);
apiV1.use('/admin', adminRoutes);
apiV1.use('/settings', settingRoutes);
apiV1.use('/catalog', catalogRoutes);
apiV1.use('/categories', catalogRoutes);
apiV1.use('/serviceability', catalogRoutes);

app.use('/api/v1', apiV1);

// Centralized error handler
app.use(errorHandler);

// Standalone Server Bootstrap
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    // Auto-seed if db is empty
    const { autoSeedIfEmpty } = await import('./db/seed.js');
    await autoSeedIfEmpty();

    app.listen(config.port, () => {
      console.log(`\n🚀 Karanjaghadge Local API running at http://localhost:${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/health\n`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}
