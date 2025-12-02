/**
 * API Service for authentication & future backend calls.
 *
 * This file is now wired to the NEW backend's seller auth endpoints:
 * - POST /api/sellers/signup-seller          → send OTP for signup
 * - POST /api/sellers/verify-otp-seller     → verify signup OTP, return JWT + seller info
 * - POST /api/sellers/login-seller          → login with phone + password, return JWT + seller info
 *
 * OTP login (without password) is not implemented on the backend, so the
 * sendLoginOtp/loginWithOtp helpers are still stubs for now.
 */

import { API_BASE_URL_DEV, API_BASE_URL_DEV_IP, API_BASE_URL_PROD, USE_IP_ADDRESS } from './apiConfig';
import { storage, AUTH_TOKEN_KEY } from '../authentication/storage';

// Determine the API base URL based on environment and configuration
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return API_BASE_URL_PROD;
  }

  // In development, use the configured URL
  if (USE_IP_ADDRESS) {
    return API_BASE_URL_DEV_IP;
  }

  // Default to localhost (requires ADB reverse port forwarding)
  return API_BASE_URL_DEV;
};

const API_BASE_URL = getApiBaseUrl();

// Types kept so screens compile; adjusted to match seller auth backend
interface SignupRequest {
  fullName: string;
  phone: string;
  password: string;
}

interface VerifyOtpRequest {
  phone: string;
  code: string;
}

interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  phone: string;
}

/**
 * Helper to handle JSON responses and throw useful errors.
 */
const parseJsonOrText = async (response: Response): Promise<any> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    // Fallback to plain text
    return text;
  }
};

/**
 * Sign up a new seller - sends OTP to phone.
 * Backend: POST /api/sellers/signup-seller
 * Body: { fullName, phone, password }
 * Returns: OTP code (for testing / dev)
 */
export const signup = async (data: SignupRequest): Promise<string> => {
  const url = `${API_BASE_URL}/api/sellers/signup-seller`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: data.fullName,
      phone: data.phone,
      password: data.password,
    }),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Signup failed';
    throw new Error(message);
  }

  // Expecting { message, otp } from backend
  if (payload && typeof payload === 'object') {
    return payload.otp || '';
  }

  return '';
};

/**
 * Verify OTP for signup and get JWT token + seller info.
 * Backend: POST /api/sellers/verify-otp-seller
 * Body: { phone, code }
 * Returns: { message, token, sellerId, fullName, phone }
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/api/sellers/verify-otp-seller`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: data.phone,
      code: data.code,
    }),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'OTP verification failed';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || !payload.token) {
    throw new Error('Invalid OTP response from server');
  }

  const userId = typeof payload.sellerId === 'number' ? payload.sellerId : NaN;

  return {
    token: payload.token,
    userId,
    fullName: payload.fullName ?? '',
    phone: payload.phone ?? data.phone,
  };
};

/**
 * Send OTP for login (NOT supported on backend yet).
 * For now this is a stub that always throws.
 */
export const sendLoginOtp = async (_phone: string): Promise<string> => {
  throw new Error('OTP login is not supported with the current backend. Please use password login.');
};

/**
 * Login seller with phone + password.
 * Backend: POST /api/sellers/login-seller
 * Body: { phone, password }
 * Returns: SellerAuthResponse or { message, token, sellerId, fullName, phone }
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/api/sellers/login-seller`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: data.phone,
      password: data.password,
    }),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Login failed';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || !payload.token) {
    throw new Error('Invalid login response from server');
  }

  const userId =
    typeof payload.userId === 'number'
      ? payload.userId
      : typeof payload.sellerId === 'number'
      ? payload.sellerId
      : NaN;

  return {
    token: payload.token,
    userId,
    fullName: payload.fullName ?? '',
    phone: payload.phone ?? data.phone,
  };
};

/**
 * Login with OTP (NOT supported on backend yet).
 * For now this is a stub that always throws.
 */
export const loginWithOtp = async (_phone: string, _otpCode: string): Promise<AuthResponse> => {
  throw new Error('OTP login is not supported with the current backend. Please use password login.');
};

/**
 * =============================
 * STORE DETAILS APIs
 * =============================
 */

export interface StoreDetailsResponse {
  storeId: number;
  storeName: string;
  storeLink: string;
}

export interface StoreAddressResponse {
  addressId: number;
}

export interface BusinessDetailsResponse {
  businessId: number;
}

export interface ProductDto {
  productsId: number;
  productName: string;
  sellingPrice: number;
  mrp?: number;
  inventoryQuantity?: number;
  productImages?: string[];
  socialSharingImage?: string | null;
}

/**
 * Create or update store details for the logged-in seller.
 * Backend: POST /api/stores/addStore
 * Body: { storeName, storeLink, seller: { sellerId } }
 */
export const saveStoreDetails = async (
  storeName: string,
  storeLink: string,
): Promise<StoreDetailsResponse> => {
  const url = `${API_BASE_URL}/api/stores/addStore`;

  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userId = await storage.getItem('userId'); // sellerId from auth

  const body: any = {
    storeName,
    storeLink,
  };

  if (userId) {
    body.seller = { sellerId: Number(userId) };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to save store details';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || payload.storeId == null) {
    throw new Error('Invalid store details response from server');
  }

  // Cache storeId for later use (e.g., address/business details)
  await storage.setItem('storeId', String(payload.storeId));

  return {
    storeId: payload.storeId,
    storeName: payload.storeName ?? storeName,
    storeLink: payload.storeLink ?? storeLink,
  };
};

/**
 * Create or update store address for the current store.
 * Backend: POST /api/store-address/addAddress
 */
export const saveStoreAddress = async (params: {
  addressLine1: string;
  addressLine2: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}): Promise<StoreAddressResponse> => {
  const url = `${API_BASE_URL}/api/store-address/addAddress`;

  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const storeId = await storage.getItem('storeId');

  const body: any = {
    shopNoBuildingCompanyApartment: params.addressLine1,
    areaStreetSectorVillage: params.addressLine2,
    landmark: params.landmark ?? '',
    pincode: params.pincode,
    townCity: params.city,
    state: params.state,
  };

  if (storeId) {
    body.storeDetails = { storeId: Number(storeId) };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to save store address';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || payload.addressId == null) {
    throw new Error('Invalid store address response from server');
  }

  return {
    addressId: payload.addressId,
  };
};

/**
 * Create or update business details for the current store.
 * Backend: POST /api/business-details/addBusinessDetails
 */
export const saveBusinessDetails = async (params: {
  hasBusiness: string;
  businessSize: string;
  platforms: string[];
}): Promise<BusinessDetailsResponse> => {
  const url = `${API_BASE_URL}/api/business-details/addBusinessDetails`;

  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const storeId = await storage.getItem('storeId');

  const platformString = params.platforms.join(', ');

  const body: any = {
    ownBusiness: params.hasBusiness,
    businessSize: params.businessSize,
    platform: platformString,
    businessDescription: '', // optional for now
  };

  if (storeId) {
    body.storeDetails = { storeId: Number(storeId) };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to save business details';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || payload.businessId == null) {
    throw new Error('Invalid business details response from server');
  }

  return {
    businessId: payload.businessId,
  };
};

/**
 * Fetch all products for the current seller.
 * Backend: GET /api/products/allProduct
 */
export const fetchProducts = async (): Promise<ProductDto[]> => {
  const url = `${API_BASE_URL}/api/products/allProduct`;

  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to load products';
    throw new Error(message);
  }

  if (!payload) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error('Invalid products response from server');
  }

  return payload as ProductDto[];
};

/**
 * Create a new product.
 * Backend: POST /api/products/addProduct
 */
export const createProduct = async (body: {
  productName: string;
  description?: string;
  mrp?: number;
  sellingPrice: number;
  businessCategory?: string;
  productCategory?: string;
  inventoryQuantity?: number;
  customSku?: string;
  color?: string;
  size?: string;
  hsnCode?: string;
}) => {
  const url = `${API_BASE_URL}/api/products/addProduct`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to create product';
    throw new Error(message);
  }

  return payload;
};

/**
 * Upload a new product with images (multipart/form-data).
 * Backend: POST /api/products/upload
 */
export const uploadProductWithImages = async (params: {
  productName: string;
  description?: string;
  mrp?: number;
  sellingPrice: number;
  businessCategory?: string;
  productCategory?: string;
  inventoryQuantity?: number;
  customSku?: string;
  color?: string;
  size?: string;
  hsnCode?: string;
  seoTitleTag?: string;
  seoMetaDescription?: string;
  imageUris: string[];
}) => {
  const url = `${API_BASE_URL}/api/products/upload`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const form = new FormData();

  form.append('productName', params.productName);
  form.append('description', params.description ?? '');
  form.append('mrp', String(params.mrp ?? 0));
  form.append('sellingPrice', String(params.sellingPrice));
  form.append('businessCategory', params.businessCategory ?? '');
  form.append('productCategory', params.productCategory ?? '');
  form.append('inventoryQuantity', String(params.inventoryQuantity ?? 0));
  form.append('customSku', params.customSku ?? '');
  form.append('color', params.color ?? '');
  form.append('size', params.size ?? '');
  form.append('variant', ''); // not used for now
  form.append('hsnCode', params.hsnCode ?? '');
  form.append('seoTitleTag', params.seoTitleTag ?? params.productName);
  form.append('seoMetaDescription', params.seoMetaDescription ?? params.description ?? '');

  // Attach images
  params.imageUris.forEach((uri, index) => {
    if (!uri) return;
    form.append('productImages', {
      uri,
      name: `product_${Date.now()}_${index}.jpg`,
      type: 'image/jpeg',
    } as any);
  });

  if (params.imageUris[0]) {
    form.append('socialSharingImage', {
      uri: params.imageUris[0],
      name: `social_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  } else {
    // backend expects the field; send an empty stub
    form.append('socialSharingImage', '' as any);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to create product with images';
    throw new Error(message);
  }

  return payload;
};

export { API_BASE_URL };
