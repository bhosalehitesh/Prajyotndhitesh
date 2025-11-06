import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OfferPreviewScreenProps {
  offerData: any;
  onCreateOffer: () => void;
}

export default function OfferPreviewScreen({ offerData = {}, onCreateOffer }: OfferPreviewScreenProps) {
  // Ensure offerData always has valid structure
  const safeOfferData = {
    offerType: offerData?.offerType || 'percentage',
    percentageValue: offerData?.percentageValue || '',
    maxDiscount: offerData?.maxDiscount || '',
    minPurchase: offerData?.minPurchase || '',
    couponCode: offerData?.couponCode || '',
    startDate: offerData?.startDate || '',
    endDate: offerData?.endDate || '',
    usageLimit: offerData?.usageLimit || '1',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[2];
    if (isNaN(day) || isNaN(month) || !year) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = month - 1;
    if (monthIndex < 0 || monthIndex >= months.length) return dateString;
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const getDiscountText = () => {
    if (safeOfferData.offerType === 'percentage') {
      const value = safeOfferData.percentageValue || '';
      let text = `${value}%`;
      if (safeOfferData.maxDiscount) {
        text += ` off up to ₹${safeOfferData.maxDiscount}`;
      } else {
        text += ' off';
      }
      return text;
    } else {
      return `₹${safeOfferData.percentageValue || ''} off`;
    }
  };

  const getFullDiscountText = () => {
    let text = '';
    if (safeOfferData.minPurchase) {
      text += `Buy for ₹${safeOfferData.minPurchase} or more, `;
    }
    text += `Get ${getDiscountText()} using **${safeOfferData.couponCode || ''}**.`;
    return text;
  };

  const getValidityText = () => {
    if (safeOfferData.startDate && safeOfferData.endDate) {
      return `Offer is valid from ${formatDate(safeOfferData.startDate)} - ${formatDate(safeOfferData.endDate)}. Hurry!.`;
    } else if (safeOfferData.startDate) {
      return `Offer is valid from ${formatDate(safeOfferData.startDate)}.`;
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
              {safeOfferData.offerType === 'percentage'
                ? `Get ${safeOfferData.percentageValue || ''}% OFF!`
                : `Get ₹${safeOfferData.percentageValue || ''} OFF!`}
            </Text>
            <Text style={styles.offerCodeText}>Use code {safeOfferData.couponCode || ''}</Text>
          </View>
        </View>

        {/* Offer Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsTitleRow}>
            <MaterialCommunityIcons name="gift" size={20} color="#f57c00" />
            <Text style={styles.detailsTitle}>Get {getDiscountText()} at Girnai</Text>
          </View>

          <Text style={styles.detailsText}>
            {safeOfferData.minPurchase
              ? `Buy for ₹${safeOfferData.minPurchase} or more, Get ${
                  safeOfferData.offerType === 'percentage'
                    ? `${safeOfferData.percentageValue || ''}% off`
                    : `₹${safeOfferData.percentageValue || ''} off`
                }${
                  safeOfferData.offerType === 'percentage' && safeOfferData.maxDiscount
                    ? ` up to ₹${safeOfferData.maxDiscount}`
                    : ''
                } using **${safeOfferData.couponCode || ''}**. `
              : `Get ${
                  safeOfferData.offerType === 'percentage'
                    ? `${safeOfferData.percentageValue || ''}% off`
                    : `₹${safeOfferData.percentageValue || ''} off`
                }${
                  safeOfferData.offerType === 'percentage' && safeOfferData.maxDiscount
                    ? ` up to ₹${safeOfferData.maxDiscount}`
                    : ''
                } using **${safeOfferData.couponCode || ''}**. `}
            {getValidityText()} This offer can be redeemed only {safeOfferData.usageLimit || '1'} times per
            customer.
          </Text>

          <TouchableOpacity onPress={() => Linking.openURL('https://www.sakhi.store/Girnai')}>
            <Text style={styles.visitLink}>Visit: https://www.sakhi.store/Girnai</Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#e61580" />
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
    backgroundColor: '#fff5f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e61580',
  },
  offerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e61580',
  },
  limitedPeriodText: {
    fontSize: 11,
    color: '#e61580',
    opacity: 0.9,
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  offerMainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e61580',
    marginBottom: 8,
  },
  offerCodeText: {
    fontSize: 16,
    color: '#363740',
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
    color: '#e61580',
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
    backgroundColor: '#e61580',
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

