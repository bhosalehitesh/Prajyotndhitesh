-- Add seller_id to Category and collections tables for seller isolation
-- This ensures each seller can only see and manage their own categories and collections

-- Add seller_id to Category table
ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS seller_id BIGINT;

-- Add seller_id to collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS seller_id BIGINT;

-- Add foreign key constraints
ALTER TABLE "Category"
ADD CONSTRAINT fk_category_seller 
    FOREIGN KEY (seller_id) 
    REFERENCES seller_details(seller_id) 
    ON DELETE CASCADE;

ALTER TABLE collections
ADD CONSTRAINT fk_collection_seller 
    FOREIGN KEY (seller_id) 
    REFERENCES seller_details(seller_id) 
    ON DELETE CASCADE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_seller_id ON "Category"(seller_id);
CREATE INDEX IF NOT EXISTS idx_collections_seller_id ON collections(seller_id);

-- Note: Existing categories and collections will have seller_id = NULL
-- You may want to manually update them or create a script to assign them to sellers
-- For new categories/collections, seller_id will be automatically set from JWT token

