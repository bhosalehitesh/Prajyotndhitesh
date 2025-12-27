-- Create store_logos table to store logo information
-- This table allows storing logo history and better organization

CREATE TABLE IF NOT EXISTS store_logos (
    logo_id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    logo_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_store_logos_store 
        FOREIGN KEY (store_id) 
        REFERENCES store_details(store_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_store_logos_seller 
        FOREIGN KEY (seller_id) 
        REFERENCES seller_details(seller_id) 
        ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_logos_store_id ON store_logos(store_id);
CREATE INDEX IF NOT EXISTS idx_store_logos_seller_id ON store_logos(seller_id);
CREATE INDEX IF NOT EXISTS idx_store_logos_active ON store_logos(is_active);

-- Create unique constraint: only one active logo per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_logos_unique_active_store 
    ON store_logos(store_id) 
    WHERE is_active = TRUE;

