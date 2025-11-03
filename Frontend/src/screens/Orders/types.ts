export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'shipped'
  | 'pickup_ready'
  | 'delivered'
  | 'canceled'
  | 'rejected';

export type PaymentStatus = 'paid' | 'pending' | 'unpaid' | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shippingAddress?: string;
}


