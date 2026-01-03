/**
 * Application Configuration Constants
 * SmartBiz by Sakhi Store - D2C E-commerce Platform
 */

export const APP_CONFIG = {
  NAME: 'SmartBiz',
  BRAND: 'SmartBiz by Sakhi Store',
  FULL_NAME: 'SmartBiz by Sakhi Store',
  DESCRIPTION: 'Build, Launch & Grow Your D2C Business',
  VERSION: '1.0.0',
  WEBSITE: 'https://smartbiz.ltd',
  STORE_URL: 'https://store.smartbiz.ltd',
  API_URL: 'https://api.smartbiz.ltd',
  SUPPORT_EMAIL: 'support@smartbiz.ltd',
  SUPPORT_PHONE: '+91 80696 40559',
  COMPANY: 'Sakhi Store',
  COPYRIGHT: '© 2025 Sakhi Store. All rights reserved.',
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
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.smartbiz.ltd/api'
    : 'http://localhost:9090/api',
  TIMEOUT: 10000, // 10 seconds
};