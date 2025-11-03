/**
 * Mock Home Screen Data
 * 
 * This file contains mock data structures for development.
 * Backend team will replace data fetching logic in useHomeData.ts
 */

import {HomeScreenData} from './types';

/**
 * Mock Home Screen Data
 * Replace with actual API call in useHomeData.ts
 */
export const mockHomeData: HomeScreenData = {
  profile: {
    name: 'Dhanlakshmi',
    avatarInitial: 'D',
    storeLink: 'sakhi.in/store',
    storeName: 'Dhanlakshmi Store',
  },
  onboardingProgress: {
    percentage: 66, // 2 out of 3 tasks completed
    totalSteps: 3,
    completedSteps: 2,
    message: 'Go live in just 1 step',
  },
  tasks: [
    {
      id: '1',
      title: 'Add a product',
      icon: 'grid',
      status: 'completed',
      action: 'Catalog',
    },
    {
      id: '2',
      title: 'Setup payments',
      icon: 'wallet',
      status: 'pending',
      action: 'PaymentSetup',
    },
    {
      id: '3',
      title: 'Enter store details',
      icon: 'home',
      status: 'completed',
      action: 'StoreDetails',
    },
  ],
  features: [
    {
      id: '1',
      title: 'GOOGLE ANALYTICS',
      description:
        'Understand your sales pattern, customer behaviour and much more with Google Analytics',
      badge: 'New!',
      actionText: 'Setup Google Analytics',
      actionRoute: 'GoogleAnalytics',
      backgroundColor: '#e61580',
    },
    // Add more feature items as needed
  ],
  storeConfiguration: [
    {
      id: '1',
      title: 'Store Appearance',
      icon: 'palette',
      route: 'StoreAppearance',
    },
    {
      id: '2',
      title: 'Collections',
      icon: 'folder',
      route: 'Collections',
    },
    {
      id: '3',
      title: 'Discount & Coupons',
      icon: 'tag',
      route: 'DiscountCoupons',
    },
    {
      id: '4',
      title: 'WhatsApp Marketing',
      icon: 'logo-whatsapp',
      route: 'WhatsAppMarketing',
    },
    {
      id: '5',
      title: 'Payment Setup',
      icon: 'card',
      route: 'PaymentSetup',
    },
    {
      id: '6',
      title: 'Delivery Settings',
      icon: 'car',
      route: 'DeliverySettings',
    },
  ],
  helpOptions: [
    {
      id: '1',
      title: 'FAQs',
      icon: 'help-circle',
      action: 'FAQs',
    },
    {
      id: '2',
      title: 'How Tos',
      icon: 'document-text',
      action: 'HowTos',
    },
    {
      id: '3',
      title: 'Contact Us',
      icon: 'call',
      action: 'ContactUs',
    },
  ],
};

