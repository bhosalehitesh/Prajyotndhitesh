/**
 * Home Screen Data Types
 * 
 * This file defines all TypeScript interfaces for Home screen data models.
 * Backend team should ensure API responses match these interfaces.
 */

// Onboarding task status
export type TaskStatus = 'completed' | 'pending';

// Onboarding task
export interface OnboardingTask {
  id: string;
  title: string;
  icon: string;
  status: TaskStatus;
  action?: string; // Navigation route or action
}

// Feature carousel item
export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  badge?: string; // "New!", "Coming Soon", etc.
  actionText: string;
  actionRoute?: string;
  backgroundColor?: string;
  image?: string; // Icon or illustration
}

// Store configuration option
export interface StoreConfigOption {
  id: string;
  title: string;
  icon: string;
  route: string;
  badge?: string;
}

// Help option
export interface HelpOption {
  id: string;
  title: string;
  icon: string;
  action: string; // URL or route
}

// User profile data
export interface UserProfile {
  name: string;
  avatar?: string;
  avatarInitial?: string;
  storeLink: string;
  storeName?: string;
}

// Home screen data
export interface HomeScreenData {
  profile: UserProfile;
  onboardingProgress: {
    percentage: number;
    totalSteps: number;
    completedSteps: number;
    message: string;
  };
  tasks: OnboardingTask[];
  features: FeatureItem[];
  storeConfiguration: StoreConfigOption[];
  helpOptions: HelpOption[];
}

// API Response
export interface HomeScreenApiResponse {
  success: boolean;
  data?: HomeScreenData;
  error?: string;
}

