import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import OfferBasicDetailsScreen from './OfferBasicDetailsScreen';
import OfferSettingsScreen from './OfferSettingsScreen';
import OfferPreviewScreen from './OfferPreviewScreen';

interface CreateNewOfferScreenProps {
  onBack: () => void;
}

interface OfferData {
  offerType: 'percentage' | 'flat';
  offerName: string;
  offerVisibility: 'visible' | 'secret';
  percentageValue: string;
  maxDiscount: string;
  minPurchase: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  setEndDate: boolean;
  customerType: 'any' | 'firstTime' | 'repeat';
  couponCode: string;
}

export default function CreateNewOfferScreen({ onBack }: CreateNewOfferScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [offerData, setOfferData] = useState<OfferData>({
    offerType: 'percentage',
    offerName: '',
    offerVisibility: 'visible',
    percentageValue: '',
    maxDiscount: '',
    minPurchase: '',
    usageLimit: '1',
    startDate: '',
    endDate: '',
    setEndDate: false,
    customerType: 'any',
    couponCode: '',
  });

  const handleNext = (stepData: Partial<OfferData>) => {
    setOfferData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const handleCreateOffer = () => {
    Alert.alert('Success', 'Your offer has been created successfully!', [
      { text: 'OK', onPress: onBack },
    ]);
  };

  const steps = [
    { number: 1, label: 'Basic Details' },
    { number: 2, label: 'Offer Settings' },
    { number: 3, label: 'Preview' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <OfferBasicDetailsScreen offerData={offerData} onNext={handleNext} />;
      case 2:
        return <OfferSettingsScreen offerData={offerData} onNext={handleNext} />;
      case 3:
        return <OfferPreviewScreen offerData={offerData} onCreateOffer={handleCreateOffer} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Offer</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep > step.number && styles.stepCircleCompleted,
                  currentStep === step.number && styles.stepCircleActive,
                  currentStep < step.number && styles.stepCircleInactive,
                ]}
              >
                {currentStep > step.number ? (
                  <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      currentStep === step.number && styles.stepNumberActive,
                      currentStep < step.number && styles.stepNumberInactive,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === step.number && styles.stepLabelActive,
                  currentStep !== step.number && styles.stepLabelInactive,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step.number ? styles.stepLineActive : styles.stepLineInactive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {renderStepContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: '#e61580',
    borderWidth: 2,
    borderColor: '#e61580',
  },
  stepCircleActive: {
    backgroundColor: '#e61580',
    borderWidth: 2,
    borderColor: '#e61580',
  },
  stepCircleInactive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e4ec',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepNumberInactive: {
    color: '#888',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  stepLabelInactive: {
    color: '#888',
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginTop: 16,
    marginHorizontal: -10,
  },
  stepLineActive: {
    backgroundColor: '#e61580',
  },
  stepLineInactive: {
    backgroundColor: '#e2e4ec',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
});

