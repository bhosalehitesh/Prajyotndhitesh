/**
 * Order Details Screen
 * Displays full order information with accept/reject functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOrderById, updateOrderStatus, OrderDto } from '../../utils/orderApi';
import { transformOrder } from './orderUtils';
import { Order } from './types';

interface RouteParams {
  orderId: string;
}

const OrderDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = (route.params as RouteParams) || {};

  const [order, setOrder] = useState<Order | null>(null);
  const [backendOrder, setBackendOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'self' | 'third-party' | null>(null);
  const [showSelfShipModal, setShowSelfShipModal] = useState(false);
  const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
  const [deliveryAgentName, setDeliveryAgentName] = useState('');
  const [deliveryAgentPhone, setDeliveryAgentPhone] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate orderId - must be numeric, not "temp-X"
      if (!orderId) {
        throw new Error('Order ID is missing. Please select a valid order.');
      }
      
      if (orderId.startsWith('temp-')) {
        throw new Error('Invalid order ID. This order does not have a valid ID. Please refresh the orders list.');
      }
      
      // Ensure orderId is numeric
      const numericId = Number(orderId);
      if (isNaN(numericId) || numericId <= 0) {
        throw new Error(`Invalid order ID format: ${orderId}. Please select a valid order.`);
      }
      
      console.log('🔍 [OrderDetails] Fetching order:', { orderId, numericId });
      const orderDto: OrderDto = await getOrderById(numericId);
      
      if (!orderDto || !orderDto.OrdersId) {
        throw new Error('Order not found. The order may have been deleted or does not exist.');
      }
      
      setBackendOrder(orderDto);
      const transformedOrder = transformOrder(orderDto);
      setOrder(transformedOrder);
    } catch (err: any) {
      console.error('❌ [OrderDetails] Error fetching order details:', err);
      const errorMessage = err.message || 'Failed to load order details. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setUpdating(true);
              await updateOrderStatus(orderId, 'PROCESSING');
              // Refresh order details to show updated status
              await fetchOrderDetails();
              Alert.alert('Success', 'Order accepted successfully!');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to accept order');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleShipOrder = () => {
    setShippingMethod(null);
    setShowShipModal(true);
  };

  const handleShipContinue = () => {
    if (!shippingMethod) {
      Alert.alert('Selection Required', 'Please select a shipping method');
      return;
    }

    // Close the shipping method selection modal
    setShowShipModal(false);

    // Open the appropriate form modal based on selection
    if (shippingMethod === 'self') {
      setShowSelfShipModal(true);
    } else if (shippingMethod === 'third-party') {
      setShowThirdPartyModal(true);
    }
  };

  const handleSelfShipSubmit = async () => {
    if (!deliveryAgentName.trim() || !deliveryAgentPhone.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      setShowSelfShipModal(false);
      
      // Update order status to SHIPPED
      await updateOrderStatus(orderId, 'SHIPPED');
      
      // Refresh order details to show updated status
      await fetchOrderDetails();
      
      // Reset form
      setDeliveryAgentName('');
      setDeliveryAgentPhone('');
      setShippingMethod(null);
      
      Alert.alert('Success', 'Order has been marked as shipped via Self Ship');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to ship order');
    } finally {
      setUpdating(false);
    }
  };

  const handleThirdPartySubmit = async () => {
    if (!partnerName.trim() || !trackingId.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      setShowThirdPartyModal(false);
      
      // Update order status to SHIPPED
      await updateOrderStatus(orderId, 'SHIPPED');
      
      // Refresh order details to show updated status
      await fetchOrderDetails();
      
      // Reset form
      setPartnerName('');
      setTrackingId('');
      setShippingMethod(null);
      
      Alert.alert('Success', `Order has been marked as shipped via ${partnerName}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to ship order');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectOrder = () => {
    if (!order) return;
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmRejection = async () => {
    if (!order) return;

    // Validate reason
    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for rejecting this order.');
      return;
    }

    try {
      setUpdating(true);
      setShowRejectModal(false);
      
      // Update order status to REJECTED with rejection reason
      await updateOrderStatus(orderId, 'REJECTED', rejectionReason.trim());
      
      Alert.alert('Success', 'Order rejected successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reject order');
    } finally {
      setUpdating(false);
      setRejectionReason('');
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`);
  };

  const getStatusSteps = () => {
    if (!order) return [];
    const statuses = ['pending', 'accepted', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    return statuses.map((status, index) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const formatDateTime = (dateString: string) => {
    try {
      // Handle both ISO string and formatted date string
      const date = dateString.includes('T') || dateString.includes('-') 
        ? new Date(dateString) 
        : new Date();
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      return `${day}-${month}-${year} ${displayHours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e61580" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'Order not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        <View style={styles.statusContainer}>
          {statusSteps.map((step, index) => (
            <React.Fragment key={index}>
              <View style={styles.statusStep}>
                <View
                  style={[
                    styles.statusCircle,
                    step.completed && styles.statusCircleCompleted,
                    step.current && styles.statusCircleCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    step.current && styles.statusLabelCurrent,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    step.completed && styles.statusLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {backendOrder?.creationTime 
                ? formatDateTime(backendOrder.creationTime) 
                : formatDateTime(order.orderDate)}
            </Text>
            <View style={styles.orderInfoRight}>
              {order.status === 'accepted' && (
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedBadgeText}>Accepted Order</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Id:</Text>
            <Text style={styles.orderInfoValue}>{order.orderNumber}</Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <Text style={styles.customerName}>
            {order.customerName || 'Customer'}
          </Text>

          <View style={styles.contactRow}>
            <Text style={styles.contactInfo}>
              {backendOrder?.customerPhone || (backendOrder?.mobile ? String(backendOrder.mobile) : 'N/A')}
            </Text>
            <View style={styles.contactIcons}>
              <TouchableOpacity
                onPress={() => handleWhatsApp(backendOrder?.customerPhone || String(backendOrder?.mobile || ''))}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCall(backendOrder?.customerPhone || String(backendOrder?.mobile || ''))}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="phone" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email if available from backend */}
          {(backendOrder?.customerEmail || backendOrder?.user?.email) && (
            <Text style={styles.email}>
              {backendOrder?.customerEmail || backendOrder?.user?.email}
            </Text>
          )}

          <Text style={styles.address}>{order.shippingAddress || 'No address provided'}</Text>
          <Text style={styles.shippingOption}>
            Shipping Option: <Text style={styles.shippingOptionValue}>Delivery</Text>
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodBadge}>
            <Text style={styles.paymentMethodText}>
              {order.paymentStatus === 'paid' ? 'Paid Online' : 'Cash on Delivery'}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Text style={styles.itemCount}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} Item{order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          {order.items.map((item, index) => {
            // Get backend order item for additional data (images, variants, etc.)
            const backendItem = backendOrder?.orderItems?.[index];
            const productImage = backendItem?.product?.productImages?.[0] || null;
            const variantName = backendItem?.variant?.variantName || null;
            const sellingPrice = backendItem?.product?.sellingPrice || item.price;
            const hasDiscount = sellingPrice > item.price;
            
            return (
              <View key={index} style={styles.orderItem}>
                {productImage ? (
                  <Image 
                    source={{ uri: productImage }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                    onError={() => console.log('Failed to load product image:', productImage)}
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <MaterialCommunityIcons name="image" size={40} color="#ccc" />
                  </View>
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {variantName && (
                    <Text style={styles.itemVariant}>{variantName}</Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    {hasDiscount && (
                      <Text style={styles.itemOriginalPrice}>₹{sellingPrice}</Text>
                    )}
                  </View>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>Qty : {item.quantity}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Cost Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Item</Text>
            <Text style={styles.costValue}>₹{order.totalAmount}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Discount</Text>
            <Text style={[styles.costValue, styles.discountValue]}>- ₹0</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Delivery Fee</Text>
            <Text style={styles.costValue}>₹0</Text>
          </View>
          {order.paymentStatus !== 'paid' && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>COD charges</Text>
              <Text style={styles.costValue}>₹10</Text>
            </View>
          )}
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>
              ₹{order.totalAmount + (order.paymentStatus !== 'paid' ? 10 : 0)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectOrder}
              disabled={updating}
            >
              <Text style={styles.rejectButtonText}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptOrder}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept Order</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons for Accepted Orders */}
        {order.status === 'accepted' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectOrder}
              disabled={updating}
            >
              <Text style={styles.rejectButtonText}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.shipButton]}
              onPress={handleShipOrder}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.shipButtonText}>Ship Order</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Rejection Reason Modal */}
        <Modal
          visible={showRejectModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reject Order</Text>
              <Text style={styles.modalSubtitle}>
                Please provide a reason for rejecting this order
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter rejection reason..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                textAlignVertical="top"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleConfirmRejection}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Reject</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Ship Order Modal */}
        <Modal
          visible={showShipModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowShipModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.shipModalContent}>
              <View style={styles.shipModalHeader}>
                <Text style={styles.shipModalTitle}>Ship Order</Text>
                <TouchableOpacity
                  onPress={() => setShowShipModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.shipModalScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.shipModalScrollContent}
              >
                <Text style={styles.shipModalQuestion}>How will the order get shipped?</Text>
                <Text style={styles.shipModalSubtext}>Select how you are going to ship this order</Text>

                <View style={styles.shippingOptions}>
                  <TouchableOpacity
                    style={[
                      styles.shippingOption,
                      shippingMethod === 'self' && styles.shippingOptionSelected
                    ]}
                    onPress={() => setShippingMethod('self')}
                  >
                    <View style={styles.radioButton}>
                      {shippingMethod === 'self' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.shippingOptionText}>Self Ship</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.shippingOption,
                      shippingMethod === 'third-party' && styles.shippingOptionSelected
                    ]}
                    onPress={() => setShippingMethod('third-party')}
                  >
                    <View style={styles.radioButton}>
                      {shippingMethod === 'third-party' && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={styles.shippingOptionContent}>
                      <Text style={styles.shippingOptionText}>Third Party Service</Text>
                      <Text style={styles.shippingOptionDescription}>
                        Select this if you are using BlueDart or any other service to ship this order.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.continueButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    shippingMethod && styles.continueButtonEnabled
                  ]}
                  onPress={handleShipContinue}
                  disabled={!shippingMethod}
                >
                  <Text style={[
                    styles.continueButtonText,
                    shippingMethod && styles.continueButtonTextEnabled
                  ]}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Self Ship Modal */}
        <Modal
          visible={showSelfShipModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSelfShipModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.shipModalContent}>
              <View style={styles.shipModalHeader}>
                <Text style={styles.shipModalTitle}>Self Ship</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowSelfShipModal(false);
                    setDeliveryAgentName('');
                    setDeliveryAgentPhone('');
                  }}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.shipModalScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.shipModalScrollContent}
              >
                <Text style={styles.shipModalQuestion}>Delivery Agent's Details</Text>
                <Text style={styles.shipModalSubtext}>
                  To ensure a smooth delivery experience for the customer, please add delivery agent's information
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Name*"
                    placeholderTextColor="#999"
                    value={deliveryAgentName}
                    onChangeText={setDeliveryAgentName}
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Phone Number*"
                    placeholderTextColor="#999"
                    value={deliveryAgentPhone}
                    onChangeText={setDeliveryAgentPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </ScrollView>

              <View style={styles.continueButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    deliveryAgentName.trim() && deliveryAgentPhone.trim() && styles.continueButtonEnabled
                  ]}
                  onPress={handleSelfShipSubmit}
                  disabled={!deliveryAgentName.trim() || !deliveryAgentPhone.trim() || updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[
                      styles.continueButtonText,
                      deliveryAgentName.trim() && deliveryAgentPhone.trim() && styles.continueButtonTextEnabled
                    ]}>
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.goBackButton}
                  onPress={() => {
                    setShowSelfShipModal(false);
                    setShowShipModal(true);
                    setDeliveryAgentName('');
                    setDeliveryAgentPhone('');
                  }}
                >
                  <Text style={styles.goBackButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Third Party Service Modal */}
        <Modal
          visible={showThirdPartyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowThirdPartyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.shipModalContent}>
              <View style={styles.shipModalHeader}>
                <Text style={styles.shipModalTitle}>Self Ship</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowThirdPartyModal(false);
                    setPartnerName('');
                    setTrackingId('');
                  }}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.shipModalScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.shipModalScrollContent}
              >
                <Text style={styles.shipModalQuestion}>Third Party Service</Text>
                <Text style={styles.shipModalSubtext}>
                  Enter the tracking code for Blue Dart, Delhivery or any other service you have used.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Partner*"
                    placeholderTextColor="#999"
                    value={partnerName}
                    onChangeText={setPartnerName}
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Tracking ID / URL*"
                    placeholderTextColor="#999"
                    value={trackingId}
                    onChangeText={setTrackingId}
                    keyboardType="default"
                    autoCapitalize="none"
                  />
                </View>
              </ScrollView>

              <View style={styles.continueButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    partnerName.trim() && trackingId.trim() && styles.continueButtonEnabled
                  ]}
                  onPress={handleThirdPartySubmit}
                  disabled={!partnerName.trim() || !trackingId.trim() || updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[
                      styles.continueButtonText,
                      partnerName.trim() && trackingId.trim() && styles.continueButtonTextEnabled
                    ]}>
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.goBackButton}
                  onPress={() => {
                    setShowThirdPartyModal(false);
                    setShowShipModal(true);
                    setPartnerName('');
                    setTrackingId('');
                  }}
                >
                  <Text style={styles.goBackButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f39c12';
    case 'accepted':
      return '#2ecc71';
    case 'shipped':
      return '#3498db';
    case 'delivered':
      return '#27ae60';
    case 'canceled':
      return '#e74c3c';
    default:
      return '#555';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e61580',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF4FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e61580',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 8,
    position: 'relative',
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginBottom: 4,
  },
  statusCircleCompleted: {
    backgroundColor: '#e61580',
  },
  statusCircleCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e61580',
  },
  statusLine: {
    position: 'absolute',
    top: 20,
    left: '12.5%',
    right: '12.5%',
    height: 2,
    backgroundColor: '#ddd',
    zIndex: 0,
  },
  statusLineCompleted: {
    backgroundColor: '#e61580',
  },
  statusLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  statusLabelCurrent: {
    color: '#e61580',
    fontWeight: '600',
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  acceptedBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  acceptedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contactIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  shippingOption: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  shippingOptionValue: {
    color: '#9b59b6',
    fontWeight: '600',
  },
  paymentMethodBadge: {
    backgroundColor: '#FFF4FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
  },
  discountValue: {
    color: '#e74c3c',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e61580',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#e5e7eb',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#e61580',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  shipButton: {
    backgroundColor: '#3498db',
  },
  shipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#e5e7eb',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalConfirmButton: {
    backgroundColor: '#e61580',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  shipModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '80%',
    position: 'absolute',
    bottom: 0,
    flex: 1,
  },
  shipModalScrollView: {
    flex: 1,
  },
  shipModalScrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  shipModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shipModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  shipModalQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  shipModalSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  shippingOptions: {
    marginBottom: 24,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  shippingOptionSelected: {
    borderColor: '#3498db',
    borderWidth: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  shippingOptionContent: {
    flex: 1,
  },
  shippingOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  shippingOptionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  continueButtonContainer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonEnabled: {
    backgroundColor: '#3498db',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  continueButtonTextEnabled: {
    color: '#fff',
  },
  inputContainer: {
    marginTop: 20,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  goBackButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default OrderDetailsScreen;
