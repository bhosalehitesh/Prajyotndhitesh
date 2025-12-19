/**
 * Application Routes Constants
 * Centralized route definitions for easy maintenance
 */

import { getStoreRoute } from '../utils/helpers';

export const ROUTES = {
  HOME: '/',
  CATEGORIES: '/categories',
  FEATURED: '/featured',
  PRODUCTS: '/products',
  COLLECTIONS: '/collections',
  PRODUCT_DETAIL: '/product/detail',
  SEARCH: '/search',
  CART: '/cart',
  WISHLIST: '/wishlist',
  ORDERS: '/orders',
  ORDER_TRACKING: '/order-tracking',
  FAQ: '/faq',
  CHECKOUT: '/checkout',
  CHECKOUT_CONFIRM: '/checkout/confirm',
  CHECKOUT_PAYMENT: '/checkout/payment',
  ORDER_SUCCESS: '/order/success',
};

/**
 * Get store-aware route path
 * @param {string} route - Base route from ROUTES constant
 * @param {string|null} storeSlug - Store slug if available
 * @returns {string} - Store-aware route path
 */
export const getRoute = (route, storeSlug) => {
  return getStoreRoute(route, storeSlug);
};

export const NAV_ITEMS = [
  { path: ROUTES.CATEGORIES, label: 'Categories' },
  { path: ROUTES.FEATURED, label: 'Featured' },
  { path: ROUTES.PRODUCTS, label: 'Products' },
];

export const MOBILE_NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Homepage' },
  { path: ROUTES.FEATURED, label: 'Featured Products' },
  { path: ROUTES.PRODUCTS, label: 'All Products' },
  { path: ROUTES.CATEGORIES, label: 'Categories', hasChevron: true },
  { path: ROUTES.COLLECTIONS, label: 'Collections', hasChevron: true },
];

