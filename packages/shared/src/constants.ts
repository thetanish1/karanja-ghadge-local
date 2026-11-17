export const APP_NAME = 'Karanjaghadge Local';

// Default pilot center point: Karanja Ghadge, Wardha district, Maharashtra
export const DEFAULT_SERVICE_AREA = {
  name: 'Karanjaghadge Town & Surroundings',
  latitude: 21.1714,
  longitude: 78.5484,
  radiusKm: 7.0, // 7km pilot delivery radius
};

export const DEFAULT_SETTINGS = {
  DELIVERY_FEE_PAISE: 0,
  PLATFORM_FEE_PAISE: 0,
  COMMISSION_PERCENT: 0,
  COD_ENABLED: true,
  PAY_DIRECT_TO_SHOP_ENABLED: true,
  FREE_PILOT_BANNER_TEXT: 'Free Community Pilot – Zero Commission & Zero Platform Fees',
  MIN_ORDER_AMOUNT_PAISE: 0,
};

export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  MAX_OTP_ATTEMPTS: 5,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
};
