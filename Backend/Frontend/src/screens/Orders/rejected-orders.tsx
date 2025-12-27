import React from 'react';
import OrdersList from './OrdersList';

const RejectedOrders = () => {
  return <OrdersList status="rejected" emptyMessage="No rejected orders yet" />;
};

export default RejectedOrders;
