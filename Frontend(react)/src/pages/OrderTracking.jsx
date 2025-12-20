import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../utils/api';
import { useStore } from '../contexts/StoreContext';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/format';
import { getRoute, ROUTES } from '../constants/routes';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentStore } = useStore();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'placed':
      case 'pending':
        return '#f39c12';
      case 'processing':
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
        return 'Order Placed';
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

  const getStatusSteps = (status) => {
    const statusLower = (status || '').toLowerCase();
    const steps = [
      { label: 'Order Placed', status: 'placed', completed: true },
      { label: 'Processing', status: 'processing', completed: statusLower === 'processing' || ['shipped', 'delivered'].includes(statusLower) },
      { label: 'Shipped', status: 'shipped', completed: statusLower === 'shipped' || statusLower === 'delivered' },
      { label: 'Delivered', status: 'delivered', completed: statusLower === 'delivered' },
    ];
    return steps;
  };

  if (loading) {
    return <Loading fullScreen text="Loading order details..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <ErrorMessage message={error} />
        <button
          onClick={() => {
            const storeSlug = currentStore?.slug;
            navigate(getRoute(ROUTES.ORDERS, storeSlug));
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#e61580',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => {
            const storeSlug = currentStore?.slug;
            navigate(getRoute(ROUTES.ORDERS, storeSlug));
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#e61580',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const orderItems = order.orderItems || [];
  const orderStatus = order.orderStatus || order.status || 'PLACED';
  const orderDate = order.creationTime || order.orderDate || order.createdAt;
<<<<<<< HEAD
  const displayOrderId = order.OrdersId || order.orderId || order.id;
=======
  const resolvedOrderId = order.OrdersId || order.orderId || order.id;
>>>>>>> 54ac9891540679f649608df5ab3bdf44aea4e092
  const statusSteps = getStatusSteps(orderStatus);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => {
            const storeSlug = currentStore?.slug;
            navigate(getRoute(ROUTES.ORDERS, storeSlug));
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '1rem',
            color: '#666',
          }}
        >
          ← Back to Orders
        </button>
<<<<<<< HEAD
        <h1 style={{marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold'}}>
          Track Order #{displayOrderId}
=======
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold' }}>
          Track Order #{resolvedOrderId}
>>>>>>> 54ac9891540679f649608df5ab3bdf44aea4e092
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Placed on {formatDate(orderDate)}
        </p>
      </div>

      {/* Order Status Timeline */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Order Status
        </h2>
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {statusSteps.map((step, index) => {
            const isActive = step.completed || statusSteps.findIndex(s => s.status === orderStatus.toLowerCase()) >= index;
            const isCurrent = step.status === orderStatus.toLowerCase();

            return (
              <div key={step.status} style={{ position: 'relative', marginBottom: index < statusSteps.length - 1 ? '2rem' : '0' }}>
                {/* Vertical Line */}
                {index < statusSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '1.5rem',
                    width: '2px',
                    height: '3rem',
                    backgroundColor: isActive ? '#e61580' : '#e0e0e0',
                  }} />
                )}
                {/* Status Circle */}
                <div style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '0',
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#e61580' : '#e0e0e0',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px ' + (isActive ? '#e61580' : '#e0e0e0'),
                }} />
                {/* Status Label */}
                <div>
                  <p style={{
                    margin: 0,
                    fontWeight: isCurrent ? '600' : '400',
                    color: isActive ? '#333' : '#999',
                    fontSize: '1rem',
                  }}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      color: '#e61580',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                    }}>
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
              Order Details
            </h2>
<<<<<<< HEAD
            <p style={{color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem'}}>
              Order #{displayOrderId}
=======
            <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              Order #{resolvedOrderId}
>>>>>>> 54ac9891540679f649608df5ab3bdf44aea4e092
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              color: '#10B981'
            }}>
              {formatCurrency(order.totalAmount || order.amount || 0)}
            </p>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              backgroundColor: getStatusColor(orderStatus) + '20',
              color: getStatusColor(orderStatus),
            }}>
              {getStatusLabel(orderStatus)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.address && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Shipping Address</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              📍 {order.address}
            </p>
            {order.mobile && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                📞 {order.mobile}
              </p>
            )}
          </div>
        )}

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
              Order Items ({orderItems.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '500', fontSize: '1rem' }}>
                        {productName}
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                        Quantity: {quantity} × {formatCurrency(price)} each
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>
                        {formatCurrency(price * quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Status */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#666', fontSize: '0.95rem' }}>
            Payment Status: <strong style={{
              color: order.paymentStatus === 'PAID' ? '#10B981' : '#f39c12',
              fontSize: '1rem',
            }}>
              {order.paymentStatus || 'PENDING'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
