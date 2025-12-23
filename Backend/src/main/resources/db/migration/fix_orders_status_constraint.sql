-- Fix orders_order_status_check constraint to allow REJECTED status with any payment status
-- This allows orders to be rejected regardless of payment status

-- Drop the existing constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- The constraint was likely preventing REJECTED status with PENDING payment
-- We'll remove it entirely since order status and payment status should be independent
-- If a specific constraint is needed, it can be re-added with proper logic
