import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, getOrderById } from '../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/format';
import { getRoute, ROUTES } from '../constants/routes';
import { useStore as useStoreContext } from '../contexts/StoreContext';

const Orders = () => {
  const { currentStore } = useStoreContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'placed':
      case 'pending':
        return '#f39c12';
      case 'processing':
      case 'accepted':
        return '#2ecc71';
      case 'shipped':
        return '#3498db';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
      case 'canceled':
        return '#e74c3c';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Pending';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'placed':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => {
        const orderStatus = (order.orderStatus || order.status || '').toLowerCase();
        switch (selectedStatus) {
          case 'pending':
            return orderStatus === 'placed' || orderStatus === 'pending';
          case 'processing':
            return orderStatus === 'processing';
          case 'shipped':
            return orderStatus === 'shipped';
          case 'delivered':
            return orderStatus === 'delivered';
          case 'cancelled':
            return orderStatus === 'cancelled' || orderStatus === 'canceled';
          default:
            return true;
        }
      });

  const handleOrderClick = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      // Navigate to order details or tracking
      const storeSlug = currentStore?.slug;
      navigate(getRoute(ROUTES.ORDER_TRACKING, storeSlug) + `?orderId=${orderId}`);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const statusTabs = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1 style={{marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold'}}>My Orders</h1>
      {currentStore && (
        <p style={{color: '#666', marginBottom: '2rem', fontSize: '1rem'}}>
          Orders for {currentStore.name}
        </p>
      )}

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid #e0e0e0',
              backgroundColor: selectedStatus === tab.value ? '#e61580' : '#fff',
              color: selectedStatus === tab.value ? '#fff' : '#666',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: selectedStatus === tab.value ? '600' : '400',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📦</div>
          <h3 style={{marginBottom: '0.5rem', color: '#333'}}>
            No {selectedStatus !== 'all' ? selectedStatus : ''} orders found
          </h3>
          <p style={{color: '#666', marginBottom: '1.5rem'}}>
            {selectedStatus === 'all' 
              ? 'Start selling to see your orders here'
              : `You don't have any ${selectedStatus} orders yet`}
          </p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {filteredOrders.map((order) => {
            // Backend returns orderItems, not items
            const orderItems = order.orderItems || order.items || [];
            const orderId = order.OrdersId || order.orderId || order.id;
            const orderStatus = order.orderStatus || order.status || 'PENDING';
            const orderDate = order.creationTime || order.orderDate || order.createdAt;

            return (
              <div
                key={orderId}
                onClick={() => handleOrderClick(orderId)}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600'}}>
                      Order #{orderId}
                    </h3>
                    <p style={{color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem'}}>
                      Placed on {formatDate(orderDate)}
                    </p>
                    {order.address && (
                      <p style={{color: '#666', margin: '0.25rem 0', fontSize: '0.85rem'}}>
                        📍 {order.address}
                      </p>
                    )}
                  </div>
                  <div style={{textAlign: 'right', marginLeft: '1rem'}}>
                    <p style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0',
                      color: '#10B981'
                    }}>
                      {formatCurrency(order.totalAmount || order.amount || 0)}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(orderStatus) + '20',
                      color: getStatusColor(orderStatus),
                    }}>
                      {getStatusLabel(orderStatus)}
                    </span>
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <h4 style={{margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600'}}>
                      Items ({orderItems.length})
                    </h4>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      {orderItems.map((item, index) => {
                        const productName = item.product?.productName || item.product?.name || item.name || `Product ${index + 1}`;
                        const quantity = item.quantity || 0;
                        const price = item.price || 0;
                        return (
                          <div
                            key={item.OrderItemsId || item.id || index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.75rem',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{flex: 1}}>
                              <p style={{margin: 0, fontWeight: '500', fontSize: '0.95rem'}}>
                                {productName}
                              </p>
                              <p style={{margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem'}}>
                                Quantity: {quantity}
                              </p>
                            </div>
                            <div style={{textAlign: 'right', marginLeft: '1rem'}}>
                              <p style={{margin: 0, fontWeight: '600', fontSize: '0.95rem'}}>
                                {formatCurrency(price * quantity)}
                              </p>
                              <p style={{margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem'}}>
                                {formatCurrency(price)} each
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{color: '#666', fontSize: '0.85rem'}}>
                    Payment: <strong style={{color: order.paymentStatus === 'PAID' ? '#10B981' : '#f39c12'}}>
                      {order.paymentStatus || 'PENDING'}
                    </strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const storeSlug = currentStore?.slug;
                      navigate(getRoute(ROUTES.ORDER_TRACKING, storeSlug) + `?orderId=${orderId}`);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e61580',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
