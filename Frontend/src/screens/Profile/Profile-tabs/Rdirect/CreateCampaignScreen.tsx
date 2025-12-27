import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectMessageScreen from './SelectMessageScreen';
import EditMessageScreen from './EditMessageScreen';
import SelectCustomerScreen from './SelectCustomerScreen';

interface CreateCampaignScreenProps {
  onBack: () => void;
}

interface CampaignData {
  selectedMessageType: string;
  selectedMessage: any;
  campaignName: string;
  discountPercentage: string;
  messageContent: string;
  selectedCustomers: Set<string>;
}

export default function CreateCampaignScreen({ onBack }: CreateCampaignScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    selectedMessageType: '',
    selectedMessage: null,
    campaignName: '',
    discountPercentage: '',
    messageContent: '',
    selectedCustomers: new Set(),
  });

  const handleNext = (stepData: Partial<CampaignData>) => {
    setCampaignData((prev) => {
      const updated = { ...prev, ...stepData };
      return updated;
    });
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const steps = [
    { number: 1, label: 'Select Message' },
    { number: 2, label: 'Edit Message' },
    { number: 3, label: 'Select Customer' },
  ];

  const handleEditMessage = (message: any) => {
    // Pre-fill the data and jump to edit step
    setCampaignData((prev) => ({
      ...prev,
      selectedMessageType: message.type,
      selectedMessage: message,
      messageContent: message.content,
    }));
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectMessageScreen
            campaignData={campaignData}
            onNext={handleNext}
            onEdit={handleEditMessage}
          />
        );
      case 2:
        return <EditMessageScreen campaignData={campaignData} onNext={handleNext} />;
      case 3:
        return <SelectCustomerScreen campaignData={campaignData} onBack={handleBack} onComplete={onBack} />;
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
        <Text style={styles.title}>Send WhatsApp messages</Text>
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
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
});

