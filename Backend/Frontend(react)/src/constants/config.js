/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  NAME: 'ABhidnya',
  BRAND: 'V Store',
  VERSION: '1.0.0',
};

export const STORAGE_KEYS = {
  CART: 'cart',
  WISHLIST: 'wishlist',
  USER: 'currentUser',
  REMEMBER_USER: 'rememberUser',
  THEME: 'theme',
  FLASH_SALE_END: 'flashSaleEndTime',
  HAS_SEEN_LOGIN: 'hasSeenLogin',
};

export const CAROUSEL_CONFIG = {
  AUTO_SLIDE_INTERVAL: 5000,
  TRANSITION_DURATION: 500,
};

export const FLASH_SALE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 10000, // 10 seconds
};

