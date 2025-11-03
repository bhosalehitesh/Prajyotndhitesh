import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CustomDomainScreen({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [domain, setDomain] = useState('');

  const dnsRecords = [
    {
      type: 'CNAME',
      name: 'www',
      value: 'd1a0wpraqmtpv3.cloudfront.net',
    },
    {
      type: 'CNAME',
      name: '_db66c46803bce7bbe3166167e429fc17',
      value: '_2adbf6f4ac69c3dfbdcf97bd3da9951d.jkdc',
    },
    {
      type: 'CAA',
      name: '@',
      flag: '0',
      tag: 'issue',
      caDomain: 'amazon.com',
    },
  ];

  const copyToClipboard = (text: string) => {
    // In a real app, you'd use Clipboard.setString(text)
    console.log('Copied:', text);
  };

  const handleSubmit = () => {
    if (domain.trim()) {
      setCurrentStep(2);
    }
  };

  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[
            styles.stepCircle,
            currentStep === 1 ? styles.stepCircleActive : currentStep > 1 ? styles.stepCompleted : styles.stepCircleInactive
          ]}>
            {currentStep > 1 ? (
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            ) : currentStep === 1 ? (
              <Text style={styles.stepNumber}>1</Text>
            ) : (
              <Text style={[styles.stepNumber, styles.stepNumberInactive]}>1</Text>
            )}
          </View>
          <Text style={[
            styles.stepText,
            currentStep === 1 ? styles.stepTextActive : currentStep > 1 ? styles.stepTextActive : styles.stepTextInactive
          ]}>
            Basic Settings
          </Text>
        </View>
        <View style={[
          styles.progressLine,
          currentStep >= 2 ? styles.lineCompleted : styles.lineInactive
        ]} />
        <View style={styles.progressStep}>
          <View style={[
            styles.stepCircle,
            currentStep === 2 ? styles.stepCircleActive : currentStep > 2 ? styles.stepCompleted : styles.stepCircleInactive
          ]}>
            {currentStep > 2 ? (
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            ) : (
              <Text style={currentStep === 2 ? styles.stepNumber : [styles.stepNumber, styles.stepNumberInactive]}>2</Text>
            )}
          </View>
          <Text style={[
            styles.stepText,
            currentStep === 2 ? styles.stepTextActive : currentStep > 2 ? styles.stepTextActive : styles.stepTextInactive
          ]}>
            DNS Setting
          </Text>
        </View>
        <View style={[
          styles.progressLine,
          currentStep >= 3 ? styles.lineCompleted : styles.lineInactive
        ]} />
        <View style={styles.progressStep}>
          <View style={[
            styles.stepCircle,
            currentStep === 3 ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            <Text style={currentStep === 3 ? styles.stepNumber : [styles.stepNumber, styles.stepNumberInactive]}>3</Text>
          </View>
          <Text style={[
            styles.stepText,
            currentStep === 3 ? styles.stepTextActive : styles.stepTextInactive
          ]}>
            Status
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Domain</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Step 1: Basic Settings */}
          {currentStep === 1 && (
            <>
              <Text style={styles.mainTitle}>Make your website truly yours</Text>
              <Text style={styles.subTitle}>Things to know before you begin</Text>
              
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information-outline" size={24} color="#17aba5" />
                <Text style={styles.infoText}>
                  Ensure you have access to your domain registrar to update DNS settings.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter your custom Domain</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.- www.funwithpun.com"
                  value={domain}
                  onChangeText={setDomain}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, !domain.trim() && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!domain.trim()}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: DNS Setting */}
          {currentStep === 2 && (
            <>
              <Text style={styles.instructionsTitle}>
                Please follow the below instructions to link your domain
              </Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>
                  1. Login to your domain registrar (eg: GoDaddy, Hostinger etc.) and select the domain you want to link.
                </Text>
                <Text style={styles.instructionItem}>
                  2. Go to 'Manage DNS settings' for your selected domain.
                </Text>
                <Text style={styles.instructionItem}>
                  3. Copy the below record info and click on "Edit/ Add Records" to link your domain
                </Text>
                <Text style={styles.instructionItem}>
                  4. Check if there is an existing CNAME record with www. If yes, then update the record data with values shown in CNAME Record 1 below. If no, then Add CNAME record 1.
                </Text>
                <Text style={styles.instructionItem}>
                  5. Add remaining CNAME record 2 and CAA Record 3 (given below).
                </Text>
                <Text style={styles.instructionItem}>
                  6. Click on Verify below to complete linking
                </Text>
              </View>

              <Text style={styles.supportText}>
                In case of any issues, reach out to our{' '}
                <Text style={styles.supportLink} onPress={() => {}}>support team</Text>
              </Text>

              {/* DNS Records Section */}
              <View style={styles.dnsSection}>
                <View style={styles.dnsHeader}>
                  <Text style={styles.dnsTitle}>DNS Records</Text>
                  <TouchableOpacity style={styles.copyAllButton} onPress={() => {
                    const allRecords = dnsRecords.map(r => `${r.type} ${r.name} ${r.value || r.caDomain}`).join('\n');
                    copyToClipboard(allRecords);
                  }}>
                    <MaterialCommunityIcons name="content-copy" size={18} color="#17aba5" />
                    <Text style={styles.copyAllText}>Copy all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.copyHintBox}>
                  <MaterialCommunityIcons name="information-outline" size={18} color="#858997" />
                  <Text style={styles.copyHintText}>You can also tap on a row to copy.</Text>
                </View>

                {dnsRecords.map((record, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recordCard}
                    onPress={() => copyToClipboard(record.value || record.caDomain || '')}
                  >
                    <Text style={styles.recordLabel}>Record {index + 1} Type</Text>
                    <Text style={styles.recordValue}>{record.type}</Text>
                    <Text style={styles.recordLabel}>Name</Text>
                    <Text style={styles.recordValue}>{record.name}</Text>
                    {record.value ? (
                      <>
                        <Text style={styles.recordLabel}>Value</Text>
                        <Text style={styles.recordValue}>{record.value}</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.recordLabel}>Flag</Text>
                        <Text style={styles.recordValue}>{record.flag}</Text>
                        <Text style={styles.recordLabel}>Tag</Text>
                        <Text style={styles.recordValue}>{record.tag}</Text>
                        <Text style={styles.recordLabel}>CA Domain</Text>
                        <Text style={styles.recordValue}>{record.caDomain}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => setCurrentStep(3)}
              >
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Status */}
          {currentStep === 3 && (
            <>
              <View style={styles.statusCard}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#17aba5" />
                <Text style={styles.statusTitle}>Verification in Progress</Text>
                <Text style={styles.statusText}>
                  We are verifying your domain connection. This may take a few minutes.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#f5f5fa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: '#17aba5',
  },
  stepCircleActive: {
    backgroundColor: '#17aba5',
  },
  stepCircleInactive: {
    backgroundColor: '#e2e4ec',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepNumberInactive: {
    color: '#858997',
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#17aba5',
    fontWeight: '600',
  },
  stepTextInactive: {
    color: '#858997',
  },
  progressLine: {
    height: 2,
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 24,
  },
  lineCompleted: {
    backgroundColor: '#17aba5',
  },
  lineInactive: {
    backgroundColor: '#e2e4ec',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  instructionsList: {
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 15,
    color: '#363740',
    lineHeight: 24,
    marginBottom: 12,
  },
  supportText: {
    fontSize: 15,
    color: '#363740',
    marginBottom: 24,
    lineHeight: 22,
  },
  supportLink: {
    color: '#17aba5',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  dnsSection: {
    marginBottom: 24,
  },
  dnsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dnsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyAllText: {
    fontSize: 14,
    color: '#17aba5',
    fontWeight: '600',
    marginLeft: 4,
  },
  copyHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  copyHintText: {
    fontSize: 14,
    color: '#858997',
    marginLeft: 8,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  recordLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#858997',
    marginTop: 8,
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 15,
    color: '#363740',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#17aba5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#858997',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#363740',
    marginLeft: 12,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  submitButton: {
    backgroundColor: '#17aba5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#e2e4ec',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 15,
    color: '#858997',
    textAlign: 'center',
    lineHeight: 22,
  },
});

