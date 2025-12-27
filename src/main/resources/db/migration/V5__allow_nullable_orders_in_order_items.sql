-- Make orders reference nullable for order_items so cart items can be saved before checkout
-- This allows OrderItems created for carts to have NULL orders until checkout creates/assigns an Orders row

ALTER TABLE order_items
    ALTER COLUMN orders_orders_id DROP NOT NULL;

-- If there is an FK constraint that prevents nulls, ensure it remains but allows NULL values
-- The foreign key constraint (if present) will still enforce existing references but NULLs are allowed now.
