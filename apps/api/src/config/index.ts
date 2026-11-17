import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karanjaghadge_local',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_karanjaghadge_pilot_2026_super_secure',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_karanjaghadge_pilot_2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  brandName: process.env.BRAND_NAME || 'Karanjaghadge Local',
  serviceArea: {
    lat: parseFloat(process.env.SERVICE_AREA_LAT || '21.1714'),
    lng: parseFloat(process.env.SERVICE_AREA_LNG || '78.5484'),
    radiusKm: parseFloat(process.env.SERVICE_AREA_RADIUS_KM || '7.0'),
  }
};
