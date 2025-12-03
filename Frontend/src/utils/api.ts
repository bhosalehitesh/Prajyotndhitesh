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

  try {
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
      return payload.otp || '';
    }

    return '';
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error during signup:', error);
      throw new Error('Network request failed. Please check your internet connection and ensure the backend is running.');
    }
    // Re-throw other errors
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

  try {
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

    if (!payload || typeof payload !== 'object' || !payload.token) {
      console.error('Invalid login response:', payload);
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
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error during login:', error);
      throw new Error('Network request failed. Please check your internet connection and ensure the backend is running.');
    }
    // Re-throw other errors
    throw error;
  }
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
  businessCategory?: string;
  productCategory?: string;
  productImages?: string[];
  socialSharingImage?: string | null;
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
 * Fetch store details for the current seller.
 * Backend: GET /api/stores/by-seller?sellerId=...
 */
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

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return {
    storeId: payload.storeId,
    storeName: payload.storeName ?? '',
    storeLink: payload.storeLink ?? '',
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

  // Attach category image (backend accepts multiple; we send at most one)
  if (params.imageUri) {
    form.append('categoryImages', {
      uri: params.imageUri,
      name: `category_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
  }

  // Social sharing image – use same image if provided, or send empty stub
  if (params.imageUri) {
    form.append('socialSharingImage', {
      uri: params.imageUri,
      name: `social_${Date.now()}.jpg`,
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
        : payload?.message || 'Failed to create category';
    throw new Error(message);
  }

  return payload as CategoryDto;
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
        : payload?.message || 'Failed to delete collection';
    throw new Error(message);
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
    throw new Error(message);
  }

  return payload;
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
  const baseUrl = `${API_BASE_URL}/api/products/addProduct`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const userId = await storage.getItem('userId');

  const url = userId ? `${baseUrl}?sellerId=${userId}` : baseUrl;

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
  const userId = await storage.getItem('userId');

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

  if (userId) {
    form.append('sellerId', userId);
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

export { API_BASE_URL };
