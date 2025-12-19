import React from 'react';
import OrdersList from './OrdersList';

const AcceptedOrders = () => {
  return <OrdersList status="accepted" emptyMessage="No accepted orders yet" />;
};

export default AcceptedOrders;
