/**
 * Theme Colors
 * 
 * This theme is consistent across the entire SakhiC app.
 */

export const theme = {
  // Primary Colors
  primary: '#e61580', // Bright pink/magenta - used for headers, active tabs, buttons
  primaryDark: '#b01266',
  
  // Secondary Colors
  secondary: '#6c757d', // Gray - used for links, accents, muted text
  
  // Background Colors
  background: '#f8f9fa', // Light gray - main background
  surface: '#FFFFFF', // White - cards, containers
  
  // Text Colors
  text: '#333333', // Dark text - primary text color
  textPrimary: '#333333', // Dark text - primary text color
  textSecondary: '#6c757d', // Muted text - secondary text
  textMuted: '#6c757d', // Muted text
  textTertiary: '#9CA3AF', // Light gray - tertiary text
  textWhite: '#FFFFFF', // White text
  
  // Status/Accent Colors
  success: '#10B981', // Green - used for amounts, completed items
  successDark: '#27AE60',
  
  // Status Colors (from OrderCard)
  statusPending: '#F39C12',
  statusAccepted: '#2ECC71',
  statusShipped: '#3498DB',
  statusPickupReady: '#9B59B6',
  statusDelivered: '#27AE60',
  statusCanceled: '#E74C3C',
  statusRejected: '#C0392B',
  
  // Border Colors
  border: '#dee2e6', // Light border
  borderLight: '#f8f9fa', // Very light border
  
  // Shadow
  shadow: '#000000',
  
  // Active/Inactive States
  activeTabBorder: '#e61580',
  inactiveTab: '#6c757d',
} as const;

export type Theme = typeof theme;

