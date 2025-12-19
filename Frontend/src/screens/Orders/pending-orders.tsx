import React from 'react';
import OrdersList from './OrdersList';

const PendingOrders = () => {
  return <OrdersList status="pending" emptyMessage="No pending orders yet" />;
};

export default PendingOrders;
