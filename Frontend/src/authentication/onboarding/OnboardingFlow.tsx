import React, { useState } from 'react';
import StoreNameScreen from './StoreNameScreen';
import StoreLocationScreen from './StoreLocationScreen';
import LocationDetailsScreen from './LocationDetailsScreen';
import StorePoliciesScreen from './StorePoliciesScreen';
import ProductCategoriesScreen from './ProductCategoriesScreen';
import BusinessInfoScreen from './BusinessInfoScreen';
import CongratulationsScreen from './CongratulationsScreen';
import { storage } from '../storage';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep =
  | 'store-name'
  | 'store-location'
  | 'location-details'
  | 'store-policies'
  | 'product-categories'
  | 'business-info'
  | 'congratulations';

interface OnboardingData {
  storeName?: string;
  address?: {
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
  };
  location?: {
    city: string;
    state: string;
    pincode: string;
  };
  policiesAgreed?: boolean;
  categories?: string[];
  businessInfo?: {
    hasBusiness: string;
    businessSize: string;
    platforms: string[];
  };
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('store-name');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const handleStoreNameNext = async (storeName: string) => {
    const updatedData = { ...onboardingData, storeName };
    setOnboardingData(updatedData);
    // Save store name immediately for easy access
    await storage.setItem('storeName', storeName);
    await storage.setItem('storeLink', `sakhi.store/${storeName.toLowerCase().replace(/\s+/g, '-')}`);
    setCurrentStep('store-location');
  };

  const handleStoreLocationNext = (address: {
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
  }) => {
    setOnboardingData((prev) => ({ ...prev, address }));
    setCurrentStep('location-details');
  };

  const handleLocationDetailsNext = (location: {
    city: string;
    state: string;
    pincode: string;
  }) => {
    setOnboardingData((prev) => ({ ...prev, location }));
    setCurrentStep('store-policies');
  };

  const handleStorePoliciesNext = () => {
    setOnboardingData((prev) => ({ ...prev, policiesAgreed: true }));
    setCurrentStep('product-categories');
  };

  const handleProductCategoriesNext = (categories: string[]) => {
    setOnboardingData((prev) => ({ ...prev, categories }));
    setCurrentStep('business-info');
  };

  const handleBusinessInfoNext = async (businessInfo: {
    hasBusiness: string;
    businessSize: string;
    platforms: string[];
  }) => {
    const updatedData = { ...onboardingData, businessInfo };
    setOnboardingData(updatedData);
    // Save onboarding data to storage
    await storage.setItem('onboardingData', JSON.stringify(updatedData));
    // Ensure store name is also saved separately
    if (updatedData.storeName) {
      await storage.setItem('storeName', updatedData.storeName);
      await storage.setItem('storeLink', `sakhi.store/${updatedData.storeName.toLowerCase().replace(/\s+/g, '-')}`);
    }
    setCurrentStep('congratulations');
  };

  const handleCongratulationsContinue = async () => {
    // Mark onboarding as complete - ensure it's saved before calling onComplete
    await storage.setItem('onboardingCompleted', 'true');
    // Double-check: also ensure store name is saved
    if (onboardingData.storeName) {
      await storage.setItem('storeName', onboardingData.storeName);
      await storage.setItem('storeLink', `sakhi.store/${onboardingData.storeName.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    // Verify it was saved
    const saved = await storage.getItem('onboardingCompleted');
    const savedStoreName = await storage.getItem('storeName');
    console.log('Onboarding completed - saved:', { saved, savedStoreName });
    
    onComplete();
  };

  const handleBack = () => {
    const stepOrder: OnboardingStep[] = [
      'store-name',
      'store-location',
      'location-details',
      'store-policies',
      'product-categories',
      'business-info',
      'congratulations',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  switch (currentStep) {
    case 'store-name':
      return (
        <StoreNameScreen
          onNext={handleStoreNameNext}
          onBack={undefined}
        />
      );
    case 'store-location':
      return (
        <StoreLocationScreen
          onNext={handleStoreLocationNext}
          onBack={handleBack}
        />
      );
    case 'location-details':
      return (
        <LocationDetailsScreen
          onNext={handleLocationDetailsNext}
          onBack={handleBack}
        />
      );
    case 'store-policies':
      return (
        <StorePoliciesScreen
          onNext={handleStorePoliciesNext}
          onBack={handleBack}
        />
      );
    case 'product-categories':
      return (
        <ProductCategoriesScreen
          onNext={handleProductCategoriesNext}
          onBack={handleBack}
        />
      );
    case 'business-info':
      return (
        <BusinessInfoScreen
          onNext={handleBusinessInfoNext}
          onBack={handleBack}
        />
      );
    case 'congratulations':
      return (
        <CongratulationsScreen onContinue={handleCongratulationsContinue} />
      );
    default:
      return null;
  }
};

export default OnboardingFlow;


