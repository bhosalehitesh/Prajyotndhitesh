import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OfferPreviewScreenProps {
  offerData: any;
  onCreateOffer: () => void;
}

export default function OfferPreviewScreen({ offerData, onCreateOffer }: OfferPreviewScreenProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
  };

  const getDiscountText = () => {
    if (offerData.offerType === 'percentage') {
      let text = `${offerData.percentageValue}%`;
      if (offerData.maxDiscount) {
        text += ` off up to ₹${offerData.maxDiscount}`;
      } else {
        text += ' off';
      }
      return text;
    } else {
      return `₹${offerData.percentageValue} off`;
    }
  };

  const getFullDiscountText = () => {
    let text = '';
    if (offerData.minPurchase) {
      text += `Buy for ₹${offerData.minPurchase} or more, `;
    }
    text += `Get ${getDiscountText()} using **${offerData.couponCode}**.`;
    return text;
  };

  const getValidityText = () => {
    if (offerData.startDate && offerData.endDate) {
      return `Offer is valid from ${formatDate(offerData.startDate)} - ${formatDate(offerData.endDate)}. Hurry!.`;
    } else if (offerData.startDate) {
      return `Offer is valid from ${formatDate(offerData.startDate)}.`;
    }
    return '';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Offer Preview</Text>
        <Text style={styles.descriptionText}>
          Share this with your customers so that they can avail the offer at checkout.
        </Text>

        {/* Offer Card */}
        <View style={styles.offerCardContainer}>
          <View style={styles.offerCard}>
            <Text style={styles.limitedPeriodText}>LIMITED PERIOD OFFER</Text>
            <Text style={styles.offerMainText}>
              {offerData.offerType === 'percentage'
                ? `Get ${offerData.percentageValue}% OFF!`
                : `Get ₹${offerData.percentageValue} OFF!`}
            </Text>
            <Text style={styles.offerCodeText}>Use code {offerData.couponCode}</Text>
          </View>
        </View>

        {/* Offer Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsTitleRow}>
            <MaterialCommunityIcons name="gift" size={20} color="#f57c00" />
            <Text style={styles.detailsTitle}>Get {getDiscountText()} at Girnai</Text>
          </View>

          <Text style={styles.detailsText}>
            {offerData.minPurchase
              ? `Buy for ₹${offerData.minPurchase} or more, Get ${
                  offerData.offerType === 'percentage'
                    ? `${offerData.percentageValue}% off`
                    : `₹${offerData.percentageValue} off`
                }${
                  offerData.offerType === 'percentage' && offerData.maxDiscount
                    ? ` up to ₹${offerData.maxDiscount}`
                    : ''
                } using **${offerData.couponCode}**. `
              : `Get ${
                  offerData.offerType === 'percentage'
                    ? `${offerData.percentageValue}% off`
                    : `₹${offerData.percentageValue} off`
                }${
                  offerData.offerType === 'percentage' && offerData.maxDiscount
                    ? ` up to ₹${offerData.maxDiscount}`
                    : ''
                } using **${offerData.couponCode}**. `}
            {getValidityText()} This offer can be redeemed only {offerData.usageLimit || '1'} times per
            customer.
          </Text>

          <TouchableOpacity onPress={() => Linking.openURL('https://www.smartbiz.in/Girnai')}>
            <Text style={styles.visitLink}>Visit: https://www.smartbiz.in/Girnai</Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#888" />
          <Text style={styles.noteText}>Note: Offers can't be edited once</Text>
        </View>

        {/* Create Offer Button */}
        <TouchableOpacity style={styles.createButton} onPress={onCreateOffer}>
          <Text style={styles.createButtonText}>Create Offer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  offerCardContainer: {
    backgroundColor: '#f5f5fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  offerCard: {
    backgroundColor: '#424242',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  limitedPeriodText: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 1,
    marginBottom: 8,
  },
  offerMainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  offerCodeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginLeft: 8,
  },
  detailsText: {
    fontSize: 15,
    color: '#363740',
    lineHeight: 24,
    marginBottom: 12,
  },
  visitLink: {
    fontSize: 15,
    color: '#17aba5',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

