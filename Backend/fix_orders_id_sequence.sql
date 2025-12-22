-- Fix orders_id column to be auto-increment
-- This script fixes the orders_id column to work with GenerationType.IDENTITY

-- Step 1: Check current state (run this first to see what we're working with)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name = 'orders_id';

-- Step 2: Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS orders_orders_id_seq;

-- Step 3: Set sequence to start from max existing value + 1 (if table has data)
DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(orders_id), 0) INTO max_id FROM orders;
    PERFORM setval('orders_orders_id_seq', max_id + 1, false);
END $$;

-- Step 4: Alter column to use sequence as default
ALTER TABLE orders 
ALTER COLUMN orders_id SET DEFAULT nextval('orders_orders_id_seq');

-- Step 5: Make sure column is NOT NULL (if not already)
ALTER TABLE orders 
ALTER COLUMN orders_id SET NOT NULL;

-- Step 6: Make sequence owned by the column (so it gets dropped if column is dropped)
ALTER SEQUENCE orders_orders_id_seq OWNED BY orders.orders_id;

-- Verify the fix (run this to confirm):
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name = 'orders_id';
-- Should show: 
--   data_type = 'bigint'
--   is_nullable = 'NO' 
--   column_default should contain 'nextval('orders_orders_id_seq'::regclass)'

