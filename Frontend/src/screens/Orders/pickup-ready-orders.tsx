import React from 'react';
import OrdersList from './OrdersList';

const PickupReadyOrders = () => {
  return <OrdersList status="pickup_ready" emptyMessage="No pickup ready orders yet" />;
};

export default PickupReadyOrders;
