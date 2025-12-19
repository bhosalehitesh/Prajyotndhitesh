import React from 'react';
import OrdersList from './OrdersList';

const ShippedOrders = () => {
  return <OrdersList status="shipped" emptyMessage="No shipped orders yet" />;
};

export default ShippedOrders;
