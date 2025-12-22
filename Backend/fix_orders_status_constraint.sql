-- Fix orders_order_status_check constraint
-- This constraint is preventing REJECTED status with PENDING payment
-- We'll drop it to allow order rejection regardless of payment status

-- Connect to your database and run this:
-- psql -U postgres -d newdb1 -f fix_orders_status_constraint.sql

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- Verify the constraint is dropped
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname LIKE '%order_status%';
