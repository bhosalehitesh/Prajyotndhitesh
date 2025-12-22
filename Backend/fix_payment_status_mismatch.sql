-- Fix Payment Status Mismatch
-- This script updates orders where payment_status is PENDING but payment is PAID
-- It syncs payment status from the Payment table to the Orders table

-- Step 1: Update orders where payment exists and is PAID, but order shows PENDING
UPDATE orders o
SET payment_status = 'PAID'
FROM payment p
WHERE p.orders_orders_id = o.orders_id
  AND p.status = 'PAID'
  AND o.payment_status = 'PENDING';

-- Step 2: For orders that are DELIVERED but payment_status is PENDING,
-- check if payment exists and update accordingly
UPDATE orders o
SET payment_status = 'PAID'
FROM payment p
WHERE p.orders_orders_id = o.orders_id
  AND p.status = 'PAID'
  AND o.order_status = 'DELIVERED'
  AND o.payment_status = 'PENDING';

-- Step 3: Show summary of all DELIVERED orders and their payment status
SELECT 
    o.orders_id,
    o.order_status,
    o.payment_status,
    p.status as payment_table_status,
    o.total_amount
FROM orders o
LEFT JOIN payment p ON p.orders_orders_id = o.orders_id
WHERE o.order_status = 'DELIVERED'
ORDER BY o.orders_id;
