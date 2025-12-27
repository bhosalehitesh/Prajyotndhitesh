/**
 * Mock API Service - Works entirely offline using local storage
 * No backend connection required - all data stored locally
 */

import { storage, AUTH_TOKEN_KEY, AUTH_PHONE_KEY } from '../authentication/storage';

// Simulate delay for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory user store (can be persisted to storage if needed)
interface User {
  id: number;
  fullName: string;
  phone: string;
  password: string;
  enabled: boolean;
  createdAt: number;
}

interface OtpData {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

class MockApiService {
  private users: Map<string, User> = new Map();
  private otpStore: Map<string, OtpData> = new Map();
  private nextUserId = 1;

  constructor() {
    this.loadUsersFromStorage();
  }

  private async loadUsersFromStorage() {
    try {
      const storedUsers = await storage.getItem('mock_users');
      if (storedUsers) {
        const usersData = JSON.parse(storedUsers);
        this.users = new Map(Object.entries(usersData));
      }
    } catch (error) {
      console.log('No existing users found, starting fresh');
    }
  }

  private async saveUsersToStorage() {
    try {
      const usersObj = Object.fromEntries(this.users);
      await storage.setItem('mock_users', JSON.stringify(usersObj));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ======================
  // AUTHENTICATION APIs
  // ======================

  /**
   * Sign up - generates OTP locally
   */
  async signup(data: {
    fullName: string;
    phone: string;
    password: string;
  }): Promise<{ message: string; otp: string }> {
    await delay(500); // Simulate network delay

    const cleanPhone = data.phone.replace(/\D/g, '');

    // Check if user already exists
    const existingUser = this.users.get(cleanPhone);
    if (existingUser && existingUser.enabled) {
      throw new Error('User with this phone already exists');
    }

    // Generate OTP
    const otpCode = this.generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    this.otpStore.set(cleanPhone, {
      phone: cleanPhone,
      code: otpCode,
      expiresAt,
      attempts: 0,
    });

    // Create or update user (disabled until OTP verified)
    if (!existingUser) {
      const user: User = {
        id: this.nextUserId++,
        fullName: data.fullName,
        phone: cleanPhone,
        password: data.password, // In real app, this would be hashed
        enabled: false,
        createdAt: Date.now(),
      };
      this.users.set(cleanPhone, user);
      await this.saveUsersToStorage();
    } else {
      existingUser.password = data.password;
      existingUser.fullName = data.fullName;
      existingUser.enabled = false;
    }

    return {
      message: `OTP sent successfully to ${cleanPhone}`,
      otp: otpCode, // Return OTP for demo/testing
    };
  }

  /**
   * Verify OTP and activate user account
   */
  async verifyOtp(data: {
    phone: string;
    code: string;
  }): Promise<void> {
    await delay(500); // Simulate network delay

    const cleanPhone = data.phone.replace(/\D/g, '');
    const otpData = this.otpStore.get(cleanPhone);

    if (!otpData) {
      throw new Error('No OTP found; request a new one');
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(cleanPhone);
      throw new Error('OTP expired; request a new one');
    }

    if (otpData.attempts >= 5) {
      throw new Error('Max attempts exceeded; request a new OTP');
    }

    if (otpData.code !== data.code) {
      otpData.attempts++;
      throw new Error('Invalid OTP code');
    }

    // Verify successful - activate user
    const user = this.users.get(cleanPhone);
    if (!user) {
      throw new Error('User not found');
    }

    user.enabled = true;
    this.otpStore.delete(cleanPhone);
    await this.saveUsersToStorage();
  }

  /**
   * Login with phone and password - returns mock JWT token
   */
  async login(data: {
    phone: string;
    password: string;
  }): Promise<{
    token: string;
    userId: number;
    fullName: string;
    phone: string;
  }> {
    await delay(500); // Simulate network delay

    const cleanPhone = data.phone.replace(/\D/g, '');
    const user = this.users.get(cleanPhone);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.enabled) {
      throw new Error('User not verified. Please verify OTP first.');
    }

    if (user.password !== data.password) {
      throw new Error('Invalid password');
    }

    // Generate mock JWT token
    const token = `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      token,
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
    };
  }
}

// Export singleton instance
export const apiService = new MockApiService();

// Export for testing or custom configuration
export default MockApiService;
