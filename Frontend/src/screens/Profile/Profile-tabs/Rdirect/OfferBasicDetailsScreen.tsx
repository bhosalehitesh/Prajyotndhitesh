import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OfferBasicDetailsScreenProps {
  offerData: any;
  onNext: (data: any) => void;
}

export default function OfferBasicDetailsScreen({
  offerData,
  onNext,
}: OfferBasicDetailsScreenProps) {
  const [offerType, setOfferType] = useState<'percentage' | 'flat'>(
    offerData.offerType || 'percentage'
  );
  const [offerName, setOfferName] = useState(offerData.offerName || '');
  const [offerVisibility, setOfferVisibility] = useState<'visible' | 'secret'>(
    offerData.offerVisibility || 'visible'
  );

  const handleNext = () => {
    if (!offerName.trim()) {
      Alert.alert('Error', 'Please enter an offer name');
      return;
    }
    if (offerName.length > 17) {
      Alert.alert('Error', 'Offer name must be 17 characters or less');
      return;
    }

    onNext({
      offerType,
      offerName: offerName.trim(),
      offerVisibility,
    });
  };

  return (
    <View style={styles.container}>
      {/* Offer Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offer Type</Text>
        <Text style={styles.sectionDesc}>Select the type of discount for this offer</Text>

        <TouchableOpacity
          style={[styles.typeCard, offerType === 'percentage' && styles.typeCardActive]}
          onPress={() => setOfferType('percentage')}
        >
          <View style={styles.radioButton}>
            {offerType === 'percentage' && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.typeContent}>
            <Text style={styles.typeTitle}>Percentage Discount</Text>
            <Text style={styles.typeExample}>E.g. Get 50% off by using GET50</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeCard, offerType === 'flat' && styles.typeCardActive]}
          onPress={() => setOfferType('flat')}
        >
          <View style={styles.radioButton}>
            {offerType === 'flat' && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.typeContent}>
            <Text style={styles.typeTitle}>Flat Amount Discount</Text>
            <Text style={styles.typeExample}>E.g. Get ₹250 off by using GET250</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Offer Name Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offer Name</Text>
        <Text style={styles.sectionDesc}>
          What is this offer called? E.g. Diwali Dhamaka (max 17 characters)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Offer Name *"
          value={offerName}
          onChangeText={setOfferName}
          maxLength={17}
        />
      </View>

      {/* Offer Visibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offer Visibility</Text>
        <Text style={styles.sectionDesc}>
          Is this offer visible to all customers or is it a secret offer?
        </Text>

        <TouchableOpacity
          style={styles.visibilityOption}
          onPress={() => setOfferVisibility('visible')}
        >
          <View style={styles.radioButton}>
            {offerVisibility === 'visible' && <View style={styles.radioButtonSelected} />}
          </View>
          <Text style={styles.visibilityText}>Visible on store</Text>
        </TouchableOpacity>

        {offerVisibility === 'visible' && (
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color="#4361ee" />
            <Text style={styles.infoText}>
              Offer will be visible to all customers and can be applied at checkout using the code.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.visibilityOption}
          onPress={() => setOfferVisibility('secret')}
        >
          <View style={styles.radioButton}>
            {offerVisibility === 'secret' && <View style={styles.radioButtonSelected} />}
          </View>
          <Text style={styles.visibilityText}>Secret Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e4ec',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  typeCardActive: {
    borderColor: '#17aba5',
    backgroundColor: '#f0fdfa',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#17aba5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#17aba5',
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 4,
  },
  typeExample: {
    fontSize: 14,
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    backgroundColor: '#fff',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  visibilityText: {
    fontSize: 16,
    color: '#363740',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginLeft: 36,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4361ee',
    marginLeft: 8,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

