-- Enable uuid generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMs
CREATE TYPE user_role AS ENUM ('ADMIN','SELLER','CUSTOMER','DELIVERY_AGENT');
CREATE TYPE order_status AS ENUM ('CREATED','PAID','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED');
CREATE TYPE payment_status AS ENUM ('INITIATED','SUCCESS','FAILED','REFUNDED','PENDING');
CREATE TYPE payment_method AS ENUM ('RAZORPAY','PAYPAL','UPI','NETBANKING','COD','OTHER');

-- USERS (All user types: admin, seller account owner, customer, delivery agent)
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
email VARCHAR(255),
mobile VARCHAR(20) NOT NULL,
password_hash VARCHAR(255),         -- optional (if using in future)
role user_role NOT NULL,
full_name VARCHAR(255),
is_active BOOLEAN NOT NULL DEFAULT TRUE,
kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX ux_users_mobile ON users(mobile);

-- SELLERS
CREATE TABLE sellers (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- owner account
business_name VARCHAR(255) NOT NULL,
business_description TEXT,
business_email VARCHAR(255),
business_phone VARCHAR(20),
gstin VARCHAR(32),
website_url VARCHAR(255),           -- optional external link
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
is_active BOOLEAN NOT NULL DEFAULT FALSE,  -- admin needs to approve
approved_at timestamptz,
admin_approved_by UUID REFERENCES users(id),
-- soft delete
deleted_at timestamptz
);

CREATE UNIQUE INDEX ux_sellers_business_name ON sellers(lower(business_name));
-- sellers can have same business name in different casing; we lower() to prevent dupes.

-- STORES / SLUGS (each seller can have a store URL slug: smartbiz.in/{slug})
CREATE TABLE stores (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
slug VARCHAR(128) NOT NULL,       -- unique per platform (smartbiz.in/slug)
name VARCHAR(255) NOT NULL,
description TEXT,
logo_url VARCHAR(1024),
banner_url VARCHAR(1024),
theme JSONB,                      -- optional customization data
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
is_live BOOLEAN NOT NULL DEFAULT FALSE,
deleted_at timestamptz
);
CREATE UNIQUE INDEX ux_stores_slug ON stores(lower(slug));

-- SELLER BANK / PAYMENT DETAILS (to route money to seller)
CREATE TABLE seller_payment_accounts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
bank_account_holder VARCHAR(255),
bank_account_number VARCHAR(64),
bank_ifsc VARCHAR(32),
payout_method VARCHAR(64),        -- e.g., 'bank_transfer', 'razorpay_payout'
external_account_id VARCHAR(255), -- id provided by payment gateway (if any)
is_default BOOLEAN NOT NULL DEFAULT FALSE,
verified BOOLEAN NOT NULL DEFAULT FALSE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_seller_payment_accounts_seller ON seller_payment_accounts(seller_id);

-- SELLER-DEFINED CATEGORIES
CREATE TABLE seller_categories (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
name VARCHAR(255) NOT NULL,
parent_id UUID REFERENCES seller_categories(id),
description TEXT,
slug VARCHAR(255),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE UNIQUE INDEX ux_seller_category_slug ON seller_categories(seller_id, lower(slug));

-- PRODUCTS (core product)
CREATE TABLE products (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
category_id UUID REFERENCES seller_categories(id),
name VARCHAR(512) NOT NULL,
short_description VARCHAR(1024),
long_description TEXT,
sku VARCHAR(128),                 -- optional product-level sku
status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE / DRAFT / INACTIVE
is_featured BOOLEAN NOT NULL DEFAULT FALSE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE INDEX ix_products_seller ON products(seller_id);
CREATE INDEX ix_products_store ON products(store_id);
CREATE INDEX ix_products_name_trgm ON products USING gin (to_tsvector('english', name || ' ' || coalesce(short_description,'')));

-- PRODUCT VARIANTS (price + stock per variant)
CREATE TABLE product_variants (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
sku VARCHAR(128),
attributes JSONB,         -- e.g. {"color":"red","size":"M"}
mrp NUMERIC(12,2) NOT NULL,
price NUMERIC(12,2) NOT NULL,
stock INTEGER NOT NULL DEFAULT 0,
low_stock_threshold INTEGER DEFAULT 5,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_variant_product ON product_variants(product_id);
CREATE INDEX ix_variant_sku ON product_variants(lower(sku)) WHERE sku IS NOT NULL;

-- PRODUCT IMAGES
CREATE TABLE product_images (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
variant_id UUID REFERENCES product_variants(id),
url VARCHAR(1024) NOT NULL,
sort_order INTEGER NOT NULL DEFAULT 0,
alt_text VARCHAR(512),
created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_product_images_product ON product_images(product_id);

-- CUSTOMER ADDRESSES (multiple)
CREATE TABLE addresses (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
label VARCHAR(64),
name VARCHAR(255),
phone VARCHAR(20),
line1 VARCHAR(512),
line2 VARCHAR(512),
city VARCHAR(128),
state VARCHAR(128),
postal_code VARCHAR(32),
country VARCHAR(64) DEFAULT 'India',
geo_point GEOMETRY, -- optional for spatial queries (PostGIS)
is_default BOOLEAN NOT NULL DEFAULT FALSE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_addresses_user ON addresses(user_id);

-- ORDERS (one order per checkout)
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
order_number VARCHAR(64) NOT NULL UNIQUE, -- human-friendly ID e.g., SB-YYYYMMDD-xxxxx
buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
shipping_address_id UUID NOT NULL REFERENCES addresses(id),
billing_address_id UUID,
total_amount NUMERIC(12,2) NOT NULL,     -- total charged
total_items INTEGER NOT NULL,
shipping_charges NUMERIC(10,2) DEFAULT 0,
discount_amount NUMERIC(10,2) DEFAULT 0,
order_status order_status NOT NULL DEFAULT 'CREATED',
placed_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
expected_delivery_date timestamptz,
delivered_at timestamptz,
cancelled_at timestamptz,
cancelled_reason TEXT,
is_complaint BOOLEAN DEFAULT FALSE
);
CREATE INDEX ix_orders_seller ON orders(seller_id);
CREATE INDEX ix_orders_buyer ON orders(buyer_id);
CREATE INDEX ix_orders_status_created ON orders(order_status, placed_at);

-- ORDER ITEMS (line items referencing product_variant)
CREATE TABLE order_items (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
variant_id UUID REFERENCES product_variants(id),
quantity INTEGER NOT NULL DEFAULT 1,
unit_price NUMERIC(12,2) NOT NULL,   -- final price per item
total_price NUMERIC(12,2) NOT NULL,
created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_order_items_order ON order_items(order_id);

-- PAYMENTS (payments per order, going to seller account)
CREATE TABLE payments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
payment_method payment_method,
status payment_status NOT NULL DEFAULT 'INITIATED',
amount NUMERIC(12,2) NOT NULL,
currency VARCHAR(8) DEFAULT 'INR',
transaction_id VARCHAR(255),         -- gateway transaction id
gateway_response JSONB,
paid_at timestamptz,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_payments_order ON payments(order_id);

-- DELIVERY AGENTS
CREATE TABLE delivery_agents (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
vehicle_details JSONB,
current_status VARCHAR(64),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

-- SHIPMENT / TRACKING (associate an agent to an order)
CREATE TABLE shipments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
delivery_agent_id UUID REFERENCES delivery_agents(id),
tracking_number VARCHAR(255),
carrier VARCHAR(128),
shipped_at timestamptz,
estimated_arrival timestamptz,
status VARCHAR(128),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

-- OTP Logs (for Kutility integration)
CREATE TABLE otp_logs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
mobile VARCHAR(20) NOT NULL,
user_id UUID REFERENCES users(id),
otp_code VARCHAR(16),        -- store hashed version if security needed
otp_hash VARCHAR(255),
purpose VARCHAR(64),        -- e.g., 'LOGIN', 'REGISTER', 'PAYMENT'
request_id VARCHAR(255),    -- Kutility's request id if provided
status VARCHAR(32),         -- 'SENT','VERIFIED','FAILED','EXPIRED'
expires_at timestamptz,
created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_otp_logs_mobile ON otp_logs(mobile);

-- REVIEWS & RATINGS (customer writes about product)
CREATE TABLE reviews (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
title VARCHAR(255),
body TEXT,
is_verified_purchase BOOLEAN DEFAULT FALSE,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_reviews_product ON reviews(product_id);

-- AUDIT / ACTIVITY LOG (optional, for compliance and traceability)
CREATE TABLE audit_logs (
id BIGSERIAL PRIMARY KEY,
entity_type VARCHAR(64),
entity_id UUID,
action VARCHAR(64),
performed_by UUID REFERENCES users(id),
payload JSONB,
created_at timestamptz NOT NULL DEFAULT now()
);

-- PLATFORM SETTINGS (feature toggles, pricing config)
CREATE TABLE platform_settings (
key VARCHAR(128) PRIMARY KEY,
value JSONB,
description TEXT,
updated_at timestamptz DEFAULT now()
);
