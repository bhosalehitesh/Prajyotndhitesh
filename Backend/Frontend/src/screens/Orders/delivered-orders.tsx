import React from 'react';
import OrdersList from './OrdersList';

const DeliveredOrders = () => {
  return <OrdersList status="delivered" emptyMessage="No delivered orders yet" />;
};

export default DeliveredOrders;
