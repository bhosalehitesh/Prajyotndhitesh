import React, { useState } from 'react';
import StoreNameScreen from './StoreNameScreen';
import StoreLocationScreen from './StoreLocationScreen';
import LocationDetailsScreen from './LocationDetailsScreen';
import StorePoliciesScreen from './StorePoliciesScreen';
import ProductCategoriesScreen from './ProductCategoriesScreen';
import BusinessInfoScreen from './BusinessInfoScreen';
import CongratulationsScreen from './CongratulationsScreen';
import { storage } from '../storage';
import { saveStoreDetails, saveStoreAddress, saveBusinessDetails, updateSellerDetails } from '../../utils/api';
import { useHeaderActions } from '../../utils/headerActions';

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

    const slug = storeName.toLowerCase();
    const storeLink = `smartbiz.ltd/${slug}`;

    // Save store name/link locally for Home screen, etc.
    await storage.setItem('storeName', storeName);
    await storage.setItem('storeLink', storeLink);

    // Persist store details to backend (creates/updates store for this seller)
    try {
      await saveStoreDetails(storeName, storeLink);
    } catch (error) {
      console.error('Failed to save store details:', error);
      // We still allow onboarding to continue; backend can be retried later from Profile/Store settings
    }

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

  const handleLocationDetailsNext = async (location: {
    city: string;
    state: string;
    pincode: string;
  }) => {
    setOnboardingData((prev) => ({ ...prev, location }));

    // ✅ CRITICAL: Save address AFTER store is created
    // The store was already created in handleStoreNameNext, so now we add the address
    // Using saveStoreAddress which will automatically link to the existing store
    try {
      const data = { ...onboardingData, location };
      if (data.address) {
        // ✅ FIX: Ensure storeId is available - if not, wait a bit and retry
        let storeId = await storage.getItem('storeId');
        if (!storeId) {
          console.warn('⚠️ [Onboarding] StoreId not found in storage, fetching from backend...');
          
          // Wait a small delay to ensure store is fully committed to database
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to fetch store details from backend
          try {
            const { getCurrentSellerStoreDetails } = await import('../../utils/api');
            const storeDetails = await getCurrentSellerStoreDetails();
            if (storeDetails?.storeId) {
              storeId = String(storeDetails.storeId);
              await storage.setItem('storeId', storeId);
              console.log('✅ [Onboarding] StoreId fetched and cached:', storeId);
            } else {
              throw new Error('Store not found for current seller');
            }
          } catch (fetchError) {
            console.error('❌ [Onboarding] Failed to fetch store details:', fetchError);
            // Store will be found automatically by saveStoreAddress using sellerId from JWT
            console.log('✅ [Onboarding] Will rely on backend to find store via JWT token');
          }
        }
        
        // ✅ Retry logic: Try saving address up to 3 times with delays
        let saved = false;
        let lastError: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await saveStoreAddress({
              addressLine1: data.address.addressLine1,
              addressLine2: data.address.addressLine2,
              landmark: data.address.landmark,
              city: location.city,
              state: location.state,
              pincode: location.pincode,
            });
            console.log('✅ [Onboarding] Store address saved successfully (attempt ' + attempt + ')');
            saved = true;
            break;
          } catch (error: any) {
            lastError = error;
            console.warn(`⚠️ [Onboarding] Address save attempt ${attempt} failed:`, error?.message);
            if (attempt < 3) {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        
        if (!saved) {
          throw lastError || new Error('Failed to save store address after 3 attempts');
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('❌ [Onboarding] Failed to save store address:', errorMessage);
      // ✅ Don't silently fail - log the error but continue onboarding
      // User can add address later from Edit Profile
      // The error is logged so we can debug it
    }

    setCurrentStep('store-policies');
  };

  const handleStorePoliciesNext = () => {
    setOnboardingData((prev) => ({ ...prev, policiesAgreed: true }));
    setCurrentStep('product-categories');
  };

  const handleProductCategoriesNext = async (categories: string[]) => {
    setOnboardingData((prev) => ({ ...prev, categories }));

    // Persist category to backend - using the new updateSellerDetails API
    try {
      const userId = await storage.getItem('userId');
      if (userId && categories && categories.length > 0) {
        // We join categories with comma for storage in the single storeCategory field
        const categoryString = categories.join(', ');
        await updateSellerDetails(userId, { storeCategory: categoryString });
      }
    } catch (error) {
      console.error('Failed to save store category:', error);
    }

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
      await storage.setItem('storeLink', `smartbiz.ltd/${updatedData.storeName.toLowerCase()}`);
    }

    // Persist business details to backend
    try {
      await saveBusinessDetails(businessInfo);
    } catch (error) {
      console.error('Failed to save business details:', error);
      // Allow onboarding to finish; can retry later from profile/settings
    }
    setCurrentStep('congratulations');
  };

  const handleCongratulationsContinue = async () => {
    // Mark onboarding as complete - ensure it's saved before calling onComplete
    await storage.setItem('onboardingCompleted', 'true');
    // Double-check: also ensure store name is saved
    if (onboardingData.storeName) {
      await storage.setItem('storeName', onboardingData.storeName);
      await storage.setItem('storeLink', `smartbiz.ltd/${onboardingData.storeName.toLowerCase()}`);
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


