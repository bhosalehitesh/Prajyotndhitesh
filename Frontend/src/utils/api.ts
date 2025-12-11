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

import { API_BASE_URL_DEV, API_BASE_URL_DEV_IP_FINAL, API_BASE_URL_PROD, USE_IP_ADDRESS } from './apiConfig';
import { storage, AUTH_TOKEN_KEY } from '../authentication/storage';

// Determine the API base URL based on environment and configuration
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return API_BASE_URL_PROD;
  }

  // In development, use the configured URL
  if (USE_IP_ADDRESS) {
    return API_BASE_URL_DEV_IP_FINAL;
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

  try {
    console.log('Signup attempt:', { fullName: data.fullName, phone: data.phone, url });
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('Signup response received:', { status: response.status, statusText: response.statusText });

    const payload = await parseJsonOrText(response);
    console.log('Signup payload:', payload);

    if (!response.ok) {
      // Log detailed error for debugging
      console.error('Signup API Error:', {
        status: response.status,
        statusText: response.statusText,
        payload,
        url,
      });
      
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || `Signup failed (${response.status}: ${response.statusText})`;
      throw new Error(message);
    }

    // Expecting { message, otp } from backend
    if (payload && typeof payload === 'object') {
      const otp = payload.otp || '';
      console.log('Signup successful, OTP received:', otp ? 'Yes' : 'No');
      return otp;
    }

    console.warn('Signup response missing OTP:', payload);
    return '';
  } catch (error: any) {
    // Handle abort/timeout errors
    if (error.name === 'AbortError') {
      console.error('Signup request timed out');
      throw new Error(
        `Request timed out. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`,
      );
    }
    
    // Handle network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
      console.error('Network error during signup:', error);
      throw new Error(
        `Network request failed. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`,
      );
    }
    
    // Re-throw other errors
    console.error('Signup error:', error);
    throw error;
  }
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

  // Extract userId from response - check both userId and sellerId fields
  let userId: number | null = null;
  
  if (typeof payload.userId === 'number' && payload.userId > 0) {
    userId = payload.userId;
  } else if (typeof payload.sellerId === 'number' && payload.sellerId > 0) {
    userId = payload.sellerId;
  }

  if (userId === null || userId <= 0) {
    console.error('Error: userId is missing or invalid in verifyOtp response:', payload);
    throw new Error('Signup failed: User ID not received from server. Please try again.');
  }

  return {
    token: payload.token,
    userId: userId,
    fullName: payload.fullName ?? '',
    phone: payload.phone ?? data.phone,
  };
};

/**
 * Send OTP for login.
 * Backend: POST /api/sellers/login-otp-seller
 * Body: { phone }
 * Returns: { message, otp }
 */
export const sendLoginOtp = async (phone: string): Promise<string> => {
  const url = `${API_BASE_URL}/api/sellers/login-otp-seller`;
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: cleanPhone,
      }),
    });

    const payload = await parseJsonOrText(response);

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || `Failed to send login OTP (${response.status}: ${response.statusText})`;
      throw new Error(message);
    }

    // Expecting { message, otp } from backend
    if (payload && typeof payload === 'object') {
      const otp = payload.otp || '';
      console.log('Login OTP sent successfully');
      return otp;
    }

    return '';
  } catch (error: any) {
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
      throw new Error(
        `Network request failed. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`,
      );
    }
    throw error;
  }
};

/**
 * Login seller with phone + password.
 * Backend: POST /api/sellers/login-seller
 * Body: { phone, password }
 * Returns: SellerAuthResponse or { message, token, sellerId, fullName, phone }
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/api/sellers/login-seller`;

  try {
    console.log('Login attempt:', { phone: data.phone, url });
    
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
    console.log('Login response:', { status: response.status, payload });

    if (!response.ok) {
      // Log detailed error for debugging
      console.error('Login API Error:', {
        status: response.status,
        statusText: response.statusText,
        payload,
        url,
      });
      
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || `Login failed (${response.status}: ${response.statusText})`;
      throw new Error(message);
    }

    if (!payload || typeof payload !== 'object') {
      console.error('Invalid login response (not an object):', payload);
      throw new Error('Invalid login response from server');
    }

    if (!payload.token) {
      console.error('Invalid login response (no token):', payload);
      throw new Error('Login failed: No token received from server');
    }

    // Extract userId from response - check both userId and sellerId fields
    let userId: number | null = null;
    
    if (typeof payload.userId === 'number' && payload.userId > 0) {
      userId = payload.userId;
    } else if (typeof payload.sellerId === 'number' && payload.sellerId > 0) {
      userId = payload.sellerId;
    }

    if (userId === null || userId <= 0) {
      console.error('Error: userId is missing or invalid in login response:', payload);
      throw new Error('Login failed: User ID not received from server. Please try again.');
    }

    const authResponse = {
      token: payload.token,
      userId: userId,
      fullName: payload.fullName ?? '',
      phone: payload.phone ?? data.phone,
    };
    
    console.log('Login successful:', { userId: authResponse.userId, fullName: authResponse.fullName });
    return authResponse;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
      console.error('Network error during login:', error);
      throw new Error(`Network request failed. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`);
    }
    // Re-throw other errors
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Login with OTP.
 * Backend: POST /api/sellers/verify-login-otp-seller
 * Body: { phone, code }
 * Returns: { token, sellerId, fullName, phone }
 */
export const loginWithOtp = async (phone: string, otpCode: string): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/api/sellers/verify-login-otp-seller`;
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: cleanPhone,
        code: otpCode,
      }),
    });

    const payload = await parseJsonOrText(response);

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || 'OTP verification failed';
      throw new Error(message);
    }

    if (!payload || typeof payload !== 'object' || !payload.token) {
      throw new Error('Invalid OTP login response from server');
    }

    // Validate userId/sellerId from payload
    const userId =
      typeof payload.userId === 'number' && payload.userId > 0
        ? payload.userId
        : typeof payload.sellerId === 'number' && payload.sellerId > 0
        ? payload.sellerId
        : null;

    if (userId === null || isNaN(userId) || userId <= 0) {
      console.error('Invalid userId in loginWithOtp response:', payload);
      throw new Error('Login failed: User ID not received from server. Please try again.');
    }

    return {
      token: payload.token,
      userId: userId,
      fullName: payload.fullName ?? '',
      phone: payload.phone ?? cleanPhone,
    };
  } catch (error: any) {
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
      throw new Error(
        `Network request failed. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`,
      );
    }
    throw error;
  }
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
  logoUrl?: string;
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
  description?: string;
  businessCategory?: string;
  productCategory?: string;
  productImages?: string[];
  socialSharingImage?: string | null;
  customSku?: string;
  color?: string;
  size?: string;
  hsnCode?: string;
}

export interface CategoryDto {
  category_id: number;
  categoryName: string;
  businessCategory?: string;
  description?: string;
  categoryImage?: string;
  seoTitleTag?: string;
  seoMetaDescription?: string;
  socialSharingImage?: string | null;
}

export interface CollectionDto {
  collectionId: number;
  collectionName: string;
  description?: string;
  collectionImage?: string;
  seoTitleTag?: string;
  seoMetaDescription?: string;
  socialSharingImage?: string | null;
}

export interface CollectionWithCountDto extends CollectionDto {
  productCount: number;
  hideFromWebsite?: boolean;
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
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userId = await storage.getItem('userId'); // sellerId from auth

  // Backend expects sellerId as query parameter, not in body
  if (!userId) {
    throw new Error('User ID (sellerId) is required to create a store. Please login again.');
  }

  const url = `${API_BASE_URL}/api/stores/addStore?sellerId=${userId}`;

  const body: any = {
    storeName,
    storeLink,
  };

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
 * Check store name availability
 * Backend: GET /api/stores/check-availability?storeName=example
 */
export interface StoreNameAvailabilityResponse {
  available: boolean;
  storeName: string;
  message: string;
}

export const checkStoreNameAvailability = async (storeName: string): Promise<StoreNameAvailabilityResponse> => {
  const url = `${API_BASE_URL}/api/stores/check-availability?storeName=${encodeURIComponent(storeName)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok) {
      return {
        available: false,
        storeName,
        message: payload?.message || 'Failed to check availability',
      };
    }
    
    return payload as StoreNameAvailabilityResponse;
  } catch (error) {
    console.error('Error checking store name availability:', error);
    return {
      available: false,
      storeName,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Fetch store details for the current seller.
 * Backend: GET /api/stores/by-seller?sellerId=...
 */
/**
 * Get seller details by sellerId.
 * Backend: GET /api/sellers/{sellerId}
 * Returns: SellerDetails with fullName, phone, sellerId, etc.
 */
export const getSellerDetails = async (sellerId: string | number): Promise<any | null> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof sellerId === 'string' ? sellerId : String(sellerId);
  const url = `${API_BASE_URL}/api/sellers/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const payload = await parseJsonOrText(response);

    if (!response.ok) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error fetching seller details:', error);
    return null;
  }
};

export const getCurrentSellerStoreDetails = async (): Promise<StoreDetailsResponse | null> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userIdRaw = await storage.getItem('userId');
  const sellerId = userIdRaw && !isNaN(Number(userIdRaw)) ? userIdRaw : null;

  if (!sellerId) {
    return null;
  }

  const url = `${API_BASE_URL}/api/stores/seller?sellerId=${sellerId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    // If backend doesn't have a store yet or any other error, just return null
    return null;
  }

  // Backend returns null when store doesn't exist (HTTP 200 with null body)
  if (payload === null || payload === undefined || typeof payload !== 'object') {
    return null;
  }

  // Validate that payload has required fields (storeId is essential)
  if (!payload.storeId) {
    return null;
  }

  const result = {
    storeId: payload.storeId,
    storeName: payload.storeName ?? '',
    storeLink: payload.storeLink ?? '',
    logoUrl: payload.logoUrl ?? undefined,
  };
  
  // Log for debugging
  if (__DEV__) {
    console.log('getCurrentSellerStoreDetails response:', {
      storeId: result.storeId,
      storeName: result.storeName,
      hasLogoUrl: !!result.logoUrl,
      logoUrl: result.logoUrl || 'None',
    });
  }
  
  return result;
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

  // Send storeId directly (backend DTO expects storeId, not nested storeDetails)
  if (storeId) {
    body.storeId = Number(storeId);
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

  // Send storeId directly (backend DTO expects storeId, not nested storeDetails)
  if (storeId) {
    body.storeId = Number(storeId);
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
 * =============================
 * CATEGORY APIs
 * Backend base path: /api/category
 * =============================
 */

/**
 * Fetch all categories (global).
 * Backend: GET /api/category/allCategory
 */
export const fetchCategories = async (): Promise<CategoryDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const url = `${API_BASE_URL}/api/category/allCategory`;

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
        : payload?.message || 'Failed to load categories';
    throw new Error(message);
  }

  if (!payload) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error('Invalid categories response from server');
  }

  return payload as CategoryDto[];
};

/**
 * Delete a category by id.
 * Backend: DELETE /api/category/{id}
 */
export const deleteCategory = async (categoryId: string | number): Promise<void> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof categoryId === 'string' ? categoryId : String(categoryId);
  const url = `${API_BASE_URL}/api/category/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
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
        : payload?.message || 'Failed to delete category';
    throw new Error(message);
  }
};

/**
 * Create a new category with optional image.
 * Backend: POST /api/category/upload (multipart/form-data)
 */
export const uploadCategoryWithImages = async (params: {
  categoryName: string;
  businessCategory: string;
  description?: string;
  seoTitleTag?: string;
  seoMetaDescription?: string;
  imageUri?: string | null;
}) => {
  const url = `${API_BASE_URL}/api/category/upload`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const form = new FormData();

  form.append('categoryName', params.categoryName);
  form.append('businessCategory', params.businessCategory);
  form.append('description', params.description ?? '');
  form.append('seoTitleTag', params.seoTitleTag ?? params.categoryName);
  form.append(
    'seoMetaDescription',
    params.seoMetaDescription ?? params.description ?? '',
  );

  // Attach category image (backend now accepts optional files)
  if (params.imageUri) {
    form.append('categoryImages', {
      uri: params.imageUri,
      name: `category_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  }

  // Social sharing image (backend now accepts optional files)
  if (params.imageUri) {
    form.append('socialSharingImage', {
      uri: params.imageUri,
      name: `social_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  }

  try {
    console.log('Uploading category:', { categoryName: params.categoryName, hasImage: !!params.imageUri });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

    const payload = await parseJsonOrText(response);
    console.log('Category upload response:', { status: response.status, payload });

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || `Failed to create category (${response.status}: ${response.statusText})`;
      console.error('Category upload failed:', { status: response.status, payload, message });
      throw new Error(message);
    }

    return payload as CategoryDto;
  } catch (error) {
    console.error('Category upload error:', error);
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create category: ${String(error)}`);
  }
};

/**
 * =============================
 * COLLECTION APIs
 * Backend base path: /api/collections
 * =============================
 */

/**
 * Fetch all collections.
 * Backend: GET /api/collections/all
 */
export const fetchCollections = async (): Promise<CollectionDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const url = `${API_BASE_URL}/api/collections/all`;

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
        : payload?.message || 'Failed to load collections';
    throw new Error(message);
  }

  if (!payload) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error('Invalid collections response from server');
  }

  return payload as CollectionDto[];
};

/**
 * Fetch all collections with product counts.
 * Backend: GET /api/collections/with-counts
 */
export const fetchCollectionsWithCounts = async (): Promise<CollectionWithCountDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const url = `${API_BASE_URL}/api/collections/with-counts`;

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
        : payload?.message || 'Failed to load collections';
    throw new Error(message);
  }

  if (!payload) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error('Invalid collections response from server');
  }

  return payload as CollectionWithCountDto[];
};

/**
 * Delete a collection by id.
 * Backend: DELETE /api/collections/{id}
 */
export const deleteCollection = async (collectionId: string | number): Promise<void> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof collectionId === 'string' ? collectionId : String(collectionId);
  const url = `${API_BASE_URL}/api/collections/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const payload = await parseJsonOrText(response);

    if (!response.ok) {
      // Log detailed error for debugging
      console.error('Delete collection API Error:', {
        status: response.status,
        statusText: response.statusText,
        payload,
        url,
        collectionId: id,
      });

      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || payload?.error || `Failed to delete collection (${response.status}: ${response.statusText})`;
      throw new Error(message);
    }

    // Success - log for debugging
    console.log('Collection deleted successfully:', { collectionId: id, payload });
  } catch (error: any) {
    // Handle network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
      console.error('Network error during collection deletion:', error);
      throw new Error(
        `Network error. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`,
      );
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Create a new collection with optional image.
 * Backend: POST /api/collections/upload (multipart/form-data)
 */
export const uploadCollectionWithImages = async (params: {
  collectionName: string;
  description?: string;
  seoTitleTag?: string;
  seoMetaDescription?: string;
  imageUri?: string | null;
}) => {
  const url = `${API_BASE_URL}/api/collections/upload`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const form = new FormData();

  form.append('collectionName', params.collectionName);
  form.append('description', params.description ?? '');
  form.append('seoTitleTag', params.seoTitleTag ?? params.collectionName);
  form.append(
    'seoMetaDescription',
    params.seoMetaDescription ?? params.description ?? '',
  );

  if (params.imageUri) {
    form.append('collectionImages', {
      uri: params.imageUri,
      name: `collection_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  }

  if (params.imageUri) {
    form.append('socialSharingImage', {
      uri: params.imageUri,
      name: `collection_social_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  } else {
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
        : payload?.message || 'Failed to create collection';
    throw new Error(message);
  }

  return payload as CollectionDto;
};

/**
 * Save products for a collection (many-to-many mapping).
 * Backend: POST /api/collections/{id}/products
 */
export const saveCollectionProducts = async (
  collectionId: number,
  productIds: number[],
) => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const url = `${API_BASE_URL}/api/collections/${collectionId}/products`;

  console.log(`Adding ${productIds.length} product(s) to collection ${collectionId}:`, productIds);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(productIds),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to update collection products';
    console.error('Failed to add products to collection:', { collectionId, productIds, error: message });
    throw new Error(message);
  }

  console.log(`Successfully added ${productIds.length} product(s) to collection ${collectionId}`);
  return payload;
};

/**
 * Add a single product to an existing collection.
 * Backend: POST /api/collections/{id}/add-product?productId=...
 */
export const addProductToCollection = async (
  collectionId: string | number,
  productId: string | number,
): Promise<CollectionDto> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof collectionId === 'string' ? collectionId : String(collectionId);
  const pid = typeof productId === 'string' ? productId : String(productId);
  const url = `${API_BASE_URL}/api/collections/${id}/add-product?productId=${pid}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to add product to collection';
    throw new Error(message);
  }

  return payload as CollectionDto;
};

/**
 * Toggle hide-from-website flag for a collection.
 * Backend: PUT /api/collections/{id}/hide-from-website?hide=true|false
 */
export const setCollectionVisibility = async (
  collectionId: string | number,
  hide: boolean,
) => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof collectionId === 'string' ? collectionId : String(collectionId);
  const url = `${API_BASE_URL}/api/collections/${id}/hide-from-website?hide=${hide ? 'true' : 'false'}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to update collection visibility';
    throw new Error(message);
  }

  return payload as CollectionDto;
};

/**
 * Fetch products for a specific collection.
 * Backend: GET /api/collections/{id}/products
 */
export const fetchProductsByCollection = async (
  collectionId: string | number,
): Promise<ProductDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof collectionId === 'string' ? collectionId : String(collectionId);
  const url = `${API_BASE_URL}/api/collections/${id}/products`;

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
        : payload?.message || 'Failed to load collection products';
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
 * Fetch all products for the current seller.
 * Backend: GET /api/products/allProduct
 */
export const fetchProducts = async (): Promise<ProductDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userIdRaw = await storage.getItem('userId');
  const sellerId = userIdRaw && !isNaN(Number(userIdRaw)) ? userIdRaw : null;

  const url = sellerId
    ? `${API_BASE_URL}/api/products/sellerProducts?sellerId=${sellerId}`
    : `${API_BASE_URL}/api/products/allProduct`;

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
 * Delete a product by id for the current seller.
 * Backend: DELETE /api/products/{id}
 */
export const deleteProduct = async (productId: string | number): Promise<void> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof productId === 'string' ? productId : String(productId);
  const url = `${API_BASE_URL}/api/products/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
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
        : payload?.message || 'Failed to delete product';
    throw new Error(message);
  }
};

/**
 * Update inventory quantity (stock) for a product.
 * Backend: PUT /api/products/{id}/stock
 */
export const updateProductStock = async (
  productId: string | number,
  inventoryQuantity: number,
) => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof productId === 'string' ? productId : String(productId);
  const url = `${API_BASE_URL}/api/products/${id}/stock`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ inventoryQuantity }),
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to update stock';
    throw new Error(message);
  }

  return payload as ProductDto;
};

/**
 * Update an existing product (JSON, without changing images).
 * Backend: PUT /api/products/{id}
 */
export const updateProduct = async (
  productId: string | number,
  body: {
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
    bestSeller?: boolean;
  },
): Promise<ProductDto> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof productId === 'string' ? productId : String(productId);
  const url = `${API_BASE_URL}/api/products/${id}`;

  const response = await fetch(url, {
    method: 'PUT',
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
        : payload?.message || 'Failed to update product';
    throw new Error(message);
  }

  return payload as ProductDto;
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
  bestSeller?: boolean;
  categoryId?: number; // ensure categoryId can be sent in JSON body
}) => {
  const baseUrl = `${API_BASE_URL}/api/products/addProduct`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userIdRaw = await storage.getItem('userId');
  
  // Debug logging
  console.log('Create product - userId from storage:', userIdRaw, 'type:', typeof userIdRaw);
  
  // Validate userId - must be a valid number > 0
  const userId = userIdRaw && !isNaN(Number(userIdRaw)) && Number(userIdRaw) > 0 
    ? String(userIdRaw) 
    : null;

  if (!userId) {
    console.error('Create product failed - userId validation:', {
      userIdRaw,
      parsed: userIdRaw ? Number(userIdRaw) : null,
      isValid: userIdRaw && !isNaN(Number(userIdRaw)) && Number(userIdRaw) > 0,
    });
    throw new Error('User ID not found. Please logout and login again to refresh your session.');
  }
  
  console.log('Create product - using userId:', userId);

  const url = `${baseUrl}?sellerId=${userId}`;

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
  categoryId?: number; // Add categoryId parameter
  bestSeller?: boolean;
}) => {
  const url = `${API_BASE_URL}/api/products/upload`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userIdRaw = await storage.getItem('userId');
  
  // Debug logging
  console.log('Product upload - userId from storage:', userIdRaw, 'type:', typeof userIdRaw);
  
  // Validate userId - must be a valid number > 0
  const userId = userIdRaw && !isNaN(Number(userIdRaw)) && Number(userIdRaw) > 0 
    ? String(userIdRaw) 
    : null;

  if (!userId) {
    console.error('Product upload failed - userId validation:', {
      userIdRaw,
      parsed: userIdRaw ? Number(userIdRaw) : null,
      isValid: userIdRaw && !isNaN(Number(userIdRaw)) && Number(userIdRaw) > 0,
    });
    throw new Error('User ID not found. Please logout and login again to refresh your session.');
  }
  
  console.log('Product upload - using userId:', userId);

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
  form.append('bestSeller', String(params.bestSeller ?? false));
  form.append('seoTitleTag', params.seoTitleTag ?? params.productName);
  form.append('seoMetaDescription', params.seoMetaDescription ?? params.description ?? '');
  form.append('sellerId', userId);

  // Add categoryId if provided
  if (params.categoryId) {
    form.append('categoryId', String(params.categoryId));
  }

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

/**
 * =============================
 * PINCODE APIs
 * Backend base path: /api/pincodes
 * =============================
 */

export interface PincodeDetails {
  valid: boolean;
  pincode: string;
  state: string;
  district: string;
  city: string;
  taluka?: string;
  division?: string;
  message?: string;
}

export interface PincodeValidationResponse {
  valid: boolean;
  pincode: string;
  state: string;
  message: string;
}

/**
 * Validate pincode and get details (state, district, city)
 * Backend: GET /api/pincodes/validate?pincode=411103
 */
export const validatePincode = async (pincode: string): Promise<PincodeDetails> => {
  const url = `${API_BASE_URL}/api/pincodes/validate?pincode=${encodeURIComponent(pincode)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok) {
      return {
        valid: false,
        pincode,
        state: '',
        district: '',
        city: '',
        message: payload?.message || 'Failed to validate pincode',
      };
    }
    
    return payload as PincodeDetails;
  } catch (error) {
    console.error('Error validating pincode:', error);
    return {
      valid: false,
      pincode,
      state: '',
      district: '',
      city: '',
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Check if pincode is valid for a state
 * Backend: GET /api/pincodes/check-state?pincode=411103&state=Maharashtra
 */
export const checkPincodeForState = async (
  pincode: string,
  state: string,
): Promise<PincodeValidationResponse> => {
  const url = `${API_BASE_URL}/api/pincodes/check-state?pincode=${encodeURIComponent(pincode)}&state=${encodeURIComponent(state)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok) {
      return {
        valid: false,
        pincode,
        state,
        message: payload?.message || 'Failed to check pincode',
      };
    }
    
    return payload as PincodeValidationResponse;
  } catch (error) {
    console.error('Error checking pincode for state:', error);
    return {
      valid: false,
      pincode,
      state,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Get all districts for a state
 * Backend: GET /api/pincodes/districts?state=Maharashtra
 */
export const getDistrictsByState = async (state: string): Promise<string[]> => {
  const url = `${API_BASE_URL}/api/pincodes/districts?state=${encodeURIComponent(state)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok || !Array.isArray(payload)) {
      return [];
    }
    
    return payload as string[];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Get all cities for a state (optionally filtered by district)
 * Backend: GET /api/pincodes/cities?state=Maharashtra&district=Pune
 */
export const getCitiesByState = async (
  state: string,
  district?: string,
): Promise<string[]> => {
  let url = `${API_BASE_URL}/api/pincodes/cities?state=${encodeURIComponent(state)}`;
  if (district) {
    url += `&district=${encodeURIComponent(district)}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok || !Array.isArray(payload)) {
      return [];
    }
    
    return payload as string[];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

/**
 * Get all states
 * Backend: GET /api/pincodes/states
 */
export const getAllStates = async (): Promise<string[]> => {
  const url = `${API_BASE_URL}/api/pincodes/states`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok || !Array.isArray(payload)) {
      return [];
    }
    
    return payload as string[];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

/**
 * Validate if city/village exists in state and district
 * Backend: GET /api/pincodes/validate-city?city=Pune&state=Maharashtra&district=Pune
 */
export interface CityValidationResponse {
  valid: boolean;
  city: string;
  state: string;
  district?: string;
  message: string;
}

export const validateCityForStateAndDistrict = async (
  city: string,
  state: string,
  district?: string,
): Promise<CityValidationResponse> => {
  let url = `${API_BASE_URL}/api/pincodes/validate-city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
  if (district) {
    url += `&district=${encodeURIComponent(district)}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const payload = await parseJsonOrText(response);
    
    if (!response.ok) {
      return {
        valid: false,
        city,
        state,
        district,
        message: payload?.message || 'Failed to validate city',
      };
    }
    
    return payload as CityValidationResponse;
  } catch (error) {
    console.error('Error validating city:', error);
    return {
      valid: false,
      city,
      state,
      district,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Upload store logo
 * Backend: POST /api/stores/upload-logo
 * FormData: { sellerId, logo (file) }
 */
export interface LogoUploadResponse {
  success: boolean;
  message: string;
  logoUrl?: string;
  storeId?: number;
}

export const uploadStoreLogo = async (
  sellerId: number,
  logoUri: string,
): Promise<LogoUploadResponse> => {
  try {
    console.log('Starting logo upload:', { sellerId, logoUri: logoUri.substring(0, 50) + '...' });
    
    const token = await storage.getItem(AUTH_TOKEN_KEY);
    
    // Create FormData for React Native (matching pattern from other uploads)
    const formData = new FormData();
    formData.append('sellerId', sellerId.toString());
    
    // Get file extension from URI
    const fileExtension = logoUri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Determine MIME type based on extension
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'gif') {
      mimeType = 'image/gif';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
    }
    
    // Append file to FormData (React Native format - matching other uploads)
    formData.append('logo', {
      uri: logoUri,
      type: mimeType,
      name: `logo_${Date.now()}.${fileExtension}`,
    } as any);

    console.log('FormData created, sending request to:', `${API_BASE_URL}/api/stores/upload-logo`);

    const uploadResponse = await fetch(`${API_BASE_URL}/api/stores/upload-logo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Don't set Content-Type header - let fetch set it with boundary automatically
      body: formData,
    });

    console.log('Upload response status:', uploadResponse.status, uploadResponse.statusText);

    const payload = await parseJsonOrText(uploadResponse);
    console.log('Upload response payload:', payload);

    if (!uploadResponse.ok) {
      const errorMessage = payload?.message || payload?.error || `Server error: ${uploadResponse.status}`;
      // Use console.warn for expected errors (like store not found) to avoid React Native error overlay
      if (errorMessage.includes('Store not found') || errorMessage.includes('store not found')) {
        console.warn('Upload failed (expected):', errorMessage);
      } else {
        console.error('Upload failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }

    if (!payload || typeof payload !== 'object') {
      console.error('Invalid response format:', payload);
      return {
        success: false,
        message: 'Invalid response from server',
      };
    }

    return payload as LogoUploadResponse;
  } catch (error: any) {
    const errorMessage = error.message || 'Network error. Please check your connection.';
    // Use console.warn for expected errors to avoid React Native error overlay
    if (errorMessage.includes('Store not found') || errorMessage.includes('store not found')) {
      console.warn('Logo upload error (expected):', errorMessage);
    } else {
      console.error('Error uploading logo:', error);
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Get store details by seller ID
 * Backend: GET /api/stores/seller?sellerId={sellerId}
 */
export interface StoreDetailsResponse {
  storeId: number;
  storeName: string;
  storeLink: string;
  logoUrl?: string;
}

export const getStoreBySellerId = async (sellerId: number): Promise<StoreDetailsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/seller?sellerId=${sellerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseJsonOrText(response);

    if (!response.ok) {
      console.error('Error fetching store:', payload);
      return null;
    }

    // Backend returns null when store doesn't exist (HTTP 200 with null body)
    if (payload === null || payload === undefined) {
      return null;
    }

    // Validate that payload has required fields (storeId is essential)
    if (typeof payload !== 'object' || !payload.storeId) {
      console.warn('Invalid store response - missing storeId:', payload);
      return null;
    }

    return payload as StoreDetailsResponse;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
};

export { API_BASE_URL };
