/**
 * Mock Analytics Data
 * 
 * This file contains mock data structures for development.
 * Backend team will replace data fetching logic in useAnalyticsData.ts
 * 
 * NOTE: Keep this file for reference - backend should ensure API responses
 * match the structure defined in types.ts
 */

import {
  AnalyticsData,
  OrdersAnalyticsData,
  SalesAnalyticsData,
  ReturnsAnalyticsData,
  CustomerDetailsAnalyticsData,
} from './types';

/**
 * Mock Orders Analytics Data
 * Replace with actual API call in useAnalyticsData.ts
 */
export const mockOrdersData: OrdersAnalyticsData = {
  insights: null, // null means no data available
  dailyOrdersTrendline: undefined, // undefined means no data
  orderStatus: undefined,
};

/**
 * Mock Sales Analytics Data
 * Replace with actual API call in useAnalyticsData.ts
 */
export const mockSalesData: SalesAnalyticsData = {
  dailySales: undefined,
  bestsellers: undefined,
  salesByCategory: undefined,
};

/**
 * Mock Returns Analytics Data
 * Replace with actual API call in useAnalyticsData.ts
 */
export const mockReturnsData: ReturnsAnalyticsData = {
  insights: null,
  returnRequestByPaymentMode: undefined,
  returnRequestsReasonCode: undefined,
  allReturns: undefined,
};

/**
 * Mock Customer Details Analytics Data
 * Replace with actual API call in useAnalyticsData.ts
 */
export const mockCustomerDetailsData: CustomerDetailsAnalyticsData = {
  insights: null,
  customersByPurchasePattern: undefined,
  customerDetails: undefined,
};

/**
 * Get mock analytics data based on tab
 * This is a placeholder - backend will implement actual data fetching
 */
export const getMockAnalyticsData = (): AnalyticsData => ({
  orders: mockOrdersData,
  sales: mockSalesData,
  returns: mockReturnsData,
  customerDetails: mockCustomerDetailsData,
});

