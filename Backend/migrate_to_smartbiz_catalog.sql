-- ============================================================
-- MIGRATION SCRIPT: Convert to SmartBiz Catalog Architecture
-- ============================================================
-- This script migrates the existing catalog to match SmartBiz 100%
-- 
-- IMPORTANT: Backup your database before running this!
-- ============================================================

-- Step 1: Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(products_id) ON DELETE CASCADE,
    sku VARCHAR(255),
    attributes_json TEXT, -- JSON string for attributes like {"color":"red","size":"M"}
    mrp NUMERIC(12,2) NOT NULL,
    selling_price NUMERIC(12,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    hsn_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(products_id) ON DELETE CASCADE
);

-- Step 2: Create indexes for product_variants
CREATE INDEX IF NOT EXISTS idx_variant_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_sku ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variant_active ON product_variants(is_active) WHERE is_active = TRUE;

-- Step 3: Add new columns to products table
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
    ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'SINGLE';

-- Step 4: Make category_id mandatory (SmartBiz rule)
-- First, set category_id for products that don't have one (use a default category or skip)
-- WARNING: This will fail if any products have NULL category_id
-- You may need to assign categories manually first
ALTER TABLE products 
    ALTER COLUMN category_id SET NOT NULL;

-- Step 5: Add order_index and slug to Category table
ALTER TABLE Category 
    ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Step 6: Migrate existing products to variants
-- For each existing product, create a variant with its current price/stock
INSERT INTO product_variants (
    product_id,
    sku,
    attributes_json,
    mrp,
    selling_price,
    stock,
    is_active,
    hsn_code,
    created_at,
    updated_at
)
SELECT 
    p.products_id AS product_id,
    COALESCE(p.custom_sku, 'SKU-' || p.products_id::TEXT) AS sku,
    CASE 
        WHEN p.color IS NOT NULL OR p.size IS NOT NULL THEN
            '{' || 
            CASE WHEN p.color IS NOT NULL THEN '"color":"' || p.color || '"' ELSE '' END ||
            CASE WHEN p.color IS NOT NULL AND p.size IS NOT NULL THEN ',' ELSE '' END ||
            CASE WHEN p.size IS NOT NULL THEN '"size":"' || p.size || '"' ELSE '' END ||
            '}'
        ELSE NULL
    END AS attributes_json,
    COALESCE(p.mrp, 0) AS mrp,
    COALESCE(p.selling_price, 0) AS selling_price,
    COALESCE(p.inventory_quantity, 0) AS stock,
    p.is_active AS is_active,
    p.hsn_code AS hsn_code,
    p.created_at AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.products_id
);

-- Step 7: Generate slugs for products (if not exists)
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Step 8: Generate slugs for categories (if not exists)
UPDATE Category 
SET slug = LOWER(REGEXP_REPLACE(category_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Step 9: Set product_type based on variant count
UPDATE products p
SET product_type = CASE 
    WHEN (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.products_id) > 1 
    THEN 'MULTI_VARIANT' 
    ELSE 'SINGLE' 
END;

-- Step 10: Auto-disable variants with stock = 0 (SmartBiz rule)
UPDATE product_variants 
SET is_active = FALSE 
WHERE stock = 0 AND is_active = TRUE;

-- Step 11: Create unique constraint on SKU per seller (optional, but recommended)
-- Note: This requires seller_id in product_variants or through products
-- You may need to adjust based on your schema

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check products without variants (should be 0)
SELECT COUNT(*) AS products_without_variants
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.products_id
);

-- Check products without category (should be 0 after migration)
SELECT COUNT(*) AS products_without_category
FROM products
WHERE category_id IS NULL;

-- Check variants with stock = 0 that are still active (should be 0)
SELECT COUNT(*) AS inactive_variants_with_stock
FROM product_variants
WHERE stock = 0 AND is_active = TRUE;

-- ============================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================
-- DROP TABLE IF EXISTS product_variants CASCADE;
-- ALTER TABLE products DROP COLUMN IF EXISTS slug;
-- ALTER TABLE products DROP COLUMN IF EXISTS product_type;
-- ALTER TABLE Category DROP COLUMN IF EXISTS order_index;
-- ALTER TABLE Category DROP COLUMN IF EXISTS slug;
-- ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
