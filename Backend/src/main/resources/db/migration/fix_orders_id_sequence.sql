-- Fix orders_id column to be auto-increment
-- Migration: Fix orders_id sequence for GenerationType.IDENTITY

-- Step 1: Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS orders_orders_id_seq;

-- Step 2: Set sequence to start from max existing value + 1 (if table has data)
DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(orders_id), 0) INTO max_id FROM orders;
    PERFORM setval('orders_orders_id_seq', max_id + 1, false);
END $$;

-- Step 3: Alter column to use sequence as default
ALTER TABLE orders 
ALTER COLUMN orders_id SET DEFAULT nextval('orders_orders_id_seq');

-- Step 4: Make sure column is NOT NULL (if not already)
ALTER TABLE orders 
ALTER COLUMN orders_id SET NOT NULL;

-- Step 5: Make sequence owned by the column (so it gets dropped if column is dropped)
ALTER SEQUENCE orders_orders_id_seq OWNED BY orders.orders_id;


