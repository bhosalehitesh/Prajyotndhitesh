/**
 * Analytics Data Types
 * 
 * This file defines all TypeScript interfaces for Analytics data models.
 * Backend team should ensure API responses match these interfaces.
 */

// Date format: DD-MM-YYYY
export type DateString = string;

// Tab types
export type AnalyticsTab = 'Orders' | 'Sales' | 'Returns' | 'Customer Details';

// Date range preset types
export type DateRangePreset = 
  | 'Today' 
  | 'Yesterday' 
  | 'This Week' 
  | 'Last Week' 
  | 'This Month' 
  | 'This Year' 
  | 'Custom';

// Order status types
export type OrderStatus = 
  | 'Accepted' 
  | 'Delivered' 
  | 'Pending' 
  | 'Cancelled' 
  | 'Processing' 
  | 'Shipped';

// Date range object
export interface DateRange {
  from: DateString;
  to: DateString;
}

// Filter parameters for API requests
export interface AnalyticsFilters {
  dateRange: DateRange;
  orderStatus?: OrderStatus[];
  tab: AnalyticsTab;
}

// ==================== ORDERS TAB DATA ====================

export interface OrdersInsights {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderGrowth?: number; // Percentage
}

export interface DailyOrderDataPoint {
  date: DateString;
  count: number;
  revenue?: number;
}

export interface OrderStatusData {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface OrdersAnalyticsData {
  insights?: OrdersInsights | null;
  dailyOrdersTrendline?: DailyOrderDataPoint[];
  orderStatus?: OrderStatusData[];
}

// ==================== SALES TAB DATA ====================

export interface DailySalesDataPoint {
  date: DateString;
  salesAmount: number; // in INR
}

export interface BestsellerProduct {
  id: string;
  name: string;
  totalSales: number; // Total sales amount
  unitsSold: number;
  image?: string;
}

export interface SalesByCategoryData {
  categoryName: string;
  salesAmount: number;
  percentage: number;
  productCount?: number;
}

export interface SalesAnalyticsData {
  dailySales?: DailySalesDataPoint[];
  bestsellers?: BestsellerProduct[];
  salesByCategory?: SalesByCategoryData[];
}

// ==================== RETURNS TAB DATA ====================

export interface ReturnsInsights {
  totalReturns: number;
  returnRate: number; // Percentage
  totalRefundAmount: number;
}

export interface ReturnRequestByPaymentMode {
  paymentMode: string; // 'UPI', 'Card', 'Cash', 'Wallet', etc.
  count: number;
  percentage: number;
}

export interface ReturnRequestReasonCode {
  reasonCode: string;
  reason: string;
  count: number;
  percentage: number;
}

export interface ReturnItem {
  id: string;
  orderId: string;
  productName: string;
  returnReason: string;
  returnDate: DateString;
  refundAmount: number;
  status: 'Pending' | 'Processed' | 'Rejected';
}

export interface ReturnsAnalyticsData {
  insights?: ReturnsInsights | null;
  returnRequestByPaymentMode?: ReturnRequestByPaymentMode[];
  returnRequestsReasonCode?: ReturnRequestReasonCode[];
  allReturns?: ReturnItem[];
}

// ==================== CUSTOMER DETAILS TAB DATA ====================

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerGrowth?: number; // Percentage
}

export interface CustomerPurchasePattern {
  patternType: string; // 'Frequent', 'Occasional', 'One-time', etc.
  customerCount: number;
  percentage: number;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: DateString;
  customerSince: DateString;
}

export interface CustomerDetailsAnalyticsData {
  insights?: CustomerInsights | null;
  customersByPurchasePattern?: CustomerPurchasePattern[];
  customerDetails?: CustomerDetail[];
}

// ==================== COMBINED ANALYTICS DATA ====================

export interface AnalyticsData {
  orders?: OrdersAnalyticsData;
  sales?: SalesAnalyticsData;
  returns?: ReturnsAnalyticsData;
  customerDetails?: CustomerDetailsAnalyticsData;
}

// API Response wrapper
export interface AnalyticsApiResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
  timestamp?: string; // ISO timestamp when data was fetched
}

