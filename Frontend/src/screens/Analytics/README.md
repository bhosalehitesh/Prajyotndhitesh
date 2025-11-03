# Analytics Module

This module provides analytics dashboards for Orders, Sales, Returns, and Customer Details.

## 📁 Folder Structure

```
Analytics/
├── AnalyticsScreen.tsx    # Main analytics screen with UI
├── types.ts               # TypeScript interfaces for all data models
├── mockData.ts            # Mock data structures (for development)
├── useAnalyticsData.ts    # Custom hook for data fetching (BACKEND INTEGRATION POINT)
└── README.md             # This file
```

## 🎯 Backend Integration Guide

### Step 1: Understand the Data Structure

All data models are defined in `types.ts`. Backend team should ensure API responses match these interfaces:

- **OrdersAnalyticsData**: Orders tab data
- **SalesAnalyticsData**: Sales tab data
- **ReturnsAnalyticsData**: Returns tab data
- **CustomerDetailsAnalyticsData**: Customer Details tab data

### Step 2: API Endpoints

The following endpoints are expected:

```
GET /api/analytics/orders
  Query params:
    - from: DateString (DD-MM-YYYY)
    - to: DateString (DD-MM-YYYY)
    - status[]: OrderStatus[] (optional)

GET /api/analytics/sales
  Query params:
    - from: DateString (DD-MM-YYYY)
    - to: DateString (DD-MM-YYYY)

GET /api/analytics/returns
  Query params:
    - from: DateString (DD-MM-YYYY)
    - to: DateString (DD-MM-YYYY)

GET /api/analytics/customers
  Query params:
    - from: DateString (DD-MM-YYYY)
    - to: DateString (DD-MM-YYYY)
```

### Step 3: Integration Point

**Replace the mock implementation in `useAnalyticsData.ts`:**

1. Open `src/screens/Analytics/useAnalyticsData.ts`
2. Find the `fetchData` function
3. Replace the mock data fetching with actual API calls
4. Ensure API responses match the interfaces in `types.ts`

Example:

```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      from: filters.dateRange.from,
      to: filters.dateRange.to,
    });

    if (filters.orderStatus && filters.orderStatus.length > 0) {
      filters.orderStatus.forEach(status => {
        params.append('status[]', status);
      });
    }

    let endpoint = '';
    switch (filters.tab) {
      case 'Orders':
        endpoint = `/api/analytics/orders?${params.toString()}`;
        break;
      // ... other cases
    }

    const response = await fetch(endpoint);
    const result: AnalyticsApiResponse = await response.json();

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch analytics data');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Data Format

#### Date Format
All dates should be in `DD-MM-YYYY` format (e.g., "01-11-2025").

#### Response Format
API responses should follow this structure:

```typescript
{
  success: boolean;
  data?: AnalyticsData;
  error?: string;
  timestamp?: string; // ISO timestamp
}
```

## 📊 Data Models

### Orders Tab
- **Insights**: Total orders, revenue, average order value
- **Daily Orders Trendline**: Array of date and order count
- **Order Status**: Distribution of orders by status

### Sales Tab
- **Daily Sales**: Array of date and sales amount (INR)
- **Bestsellers**: Top products by total sales
- **Sales by Category**: Sales distribution by category

### Returns Tab
- **Insights**: Total returns, return rate, refund amount
- **Return Request by Payment Mode**: Returns by payment method
- **Return Requests Reason Code**: Returns by reason
- **All Returns**: List of return items

### Customer Details Tab
- **Insights**: Total customers, new customers, active customers
- **Customers by Purchase Pattern**: Customer segmentation
- **Customer Details**: List of customer records

## 🔄 State Management

The screen uses React hooks for state management:
- **Filters state**: Date range, order status, active tab
- **UI state**: Modals, date picker, selections
- **Data state**: Managed by `useAnalyticsData` hook

## 📝 Notes for Backend Team

1. **No Backend Functionality**: The current implementation has no backend calls - only mock data
2. **Type Safety**: All interfaces are in `types.ts` - ensure API responses match
3. **Error Handling**: Implement proper error handling in `useAnalyticsData.ts`
4. **Loading States**: The hook provides `loading` state - use it to show loading indicators
5. **Auto-refetch**: Data refetches automatically when filters change

## 🚀 Usage

The Analytics screen is already integrated into the app navigation. No additional setup required.

Backend team just needs to:
1. Implement API endpoints
2. Replace mock data in `useAnalyticsData.ts`
3. Ensure response format matches `types.ts`

