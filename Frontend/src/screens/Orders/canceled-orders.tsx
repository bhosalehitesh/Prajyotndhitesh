import React from 'react';
import OrdersList from './OrdersList';

const CanceledOrders = () => {
  return <OrdersList status="canceled" emptyMessage="No canceled orders yet" />;
};

export default CanceledOrders;
