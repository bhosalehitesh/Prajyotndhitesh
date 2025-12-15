import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders } from '../utils/api';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/format';

const Orders = () => {
  const { currentStore, getStoreId, getSellerId } = useStore();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1>My Orders</h1>
      {currentStore && (
        <p style={{color: '#666', marginBottom: '2rem'}}>
          Orders for {currentStore.name}
        </p>
      )}

      {orders.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p>No orders found.</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {orders.map((order) => (
            <div 
              key={order.orderId || order.id} 
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff'
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div>
                  <h3>Order #{order.orderId || order.id}</h3>
                  <p style={{color: '#666', margin: 0}}>
                    Placed on {formatDate(order.orderDate || order.createdAt)}
                  </p>
                  {order.storeId && (
                    <p style={{color: '#666', margin: '0.25rem 0', fontSize: '0.9rem'}}>
                      Store ID: {order.storeId} {order.sellerId && `| Seller ID: ${order.sellerId}`}
                    </p>
                  )}
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontSize: '1.2rem', fontWeight: 'bold', margin: 0}}>
                    {formatCurrency(order.totalAmount || order.amount || 0)}
                  </p>
                  <p style={{color: '#666', margin: 0}}>
                    Status: {order.status || 'Pending'}
                  </p>
                </div>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div style={{marginTop: '1rem'}}>
                  <h4>Items:</h4>
                  <ul style={{listStyle: 'none', padding: 0}}>
                    {order.items.map((item, index) => (
                      <li key={index} style={{padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0'}}>
                        {item.name || item.productName} x {item.quantity} - {formatCurrency(item.price || 0)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

