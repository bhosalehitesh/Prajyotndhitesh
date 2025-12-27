package com.smartbiz.sakhistore.modules.product.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;

/**
 * ProductVariant - The actual sellable unit (matches SmartBiz architecture)
 * 
 * Rules:
 * - Single-product → 1 implicit variant (auto-created)
 * - Multi-variant product → many variants
 * - Website always adds variant, not product, to cart
 * - Stock = 0 → variant disabled automatically
 */
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long variantId;

    // =======================
    // 🔗 VARIANT → PRODUCT
    // =======================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    // =======================
    // VARIANT IDENTIFIERS
    // =======================
    @Column(name = "sku", unique = false) // SKU unique per seller, not globally
    private String sku;

    // =======================
    // VARIANT ATTRIBUTES (SmartBiz: JSONB attributes)
    // Stored as JSON: {"color":"red","size":"M","weight":"500g"}
    // =======================
    @Column(name = "attributes", columnDefinition = "TEXT")
    private String attributesJson; // JSON string for attributes

    // =======================
    // PRICING (Variant-level, not Product-level)
    // =======================
    @Column(name = "mrp", nullable = false)
    private Double mrp;

    @Column(name = "selling_price", nullable = false)
    private Double sellingPrice;

    // =======================
    // INVENTORY (Variant-level)
    // =======================
    @Column(name = "stock", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer stock = 0;

    @Column(name = "low_stock_threshold", columnDefinition = "INTEGER DEFAULT 5")
    private Integer lowStockThreshold = 5;

    // =======================
    // VARIANT STATUS
    // =======================
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    // =======================
    // HSN CODE (for tax)
    // =======================
    @Column(name = "hsn_code")
    private String hsnCode;

    // =======================
    // TIMESTAMPS
    // =======================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =======================
    // CONSTRUCTORS
    // =======================
    public ProductVariant() {}

    public ProductVariant(Product product, String sku, Double mrp, Double sellingPrice, Integer stock) {
        this.product = product;
        this.sku = sku;
        this.mrp = mrp;
        this.sellingPrice = sellingPrice;
        this.stock = stock != null ? stock : 0;
        this.isActive = stock != null && stock > 0;
    }

    // =======================
    // GETTERS & SETTERS
    // =======================
    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getAttributesJson() {
        return attributesJson;
    }

    public void setAttributesJson(String attributesJson) {
        this.attributesJson = attributesJson;
    }

    /**
     * Helper: Set attributes as Map (converts to JSON)
     */
    public void setAttributes(Map<String, String> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            this.attributesJson = null;
            return;
        }
        // Simple JSON serialization (for production, use Jackson ObjectMapper)
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"")
                .append(entry.getValue().replace("\"", "\\\"")).append("\"");
            first = false;
        }
        json.append("}");
        this.attributesJson = json.toString();
    }

    /**
     * Helper: Get attributes as Map (parses JSON)
     */
    public Map<String, String> getAttributes() {
        if (attributesJson == null || attributesJson.trim().isEmpty()) {
            return new HashMap<>();
        }
        // Simple JSON parsing (for production, use Jackson ObjectMapper)
        Map<String, String> map = new HashMap<>();
        try {
            String json = attributesJson.trim();
            if (json.startsWith("{") && json.endsWith("}")) {
                json = json.substring(1, json.length() - 1);
                String[] pairs = json.split(",");
                for (String pair : pairs) {
                    String[] kv = pair.split(":");
                    if (kv.length == 2) {
                        String key = kv[0].trim().replace("\"", "");
                        String value = kv[1].trim().replace("\"", "");
                        map.put(key, value);
                    }
                }
            }
        } catch (Exception e) {
            // Return empty map on parse error
        }
        return map;
    }
    
    /**
     * Get attributes for JSON response (expose as Map for frontend)
     */
    @JsonProperty("attributes")
    public Map<String, String> getAttributesForJson() {
        return getAttributes();
    }

    public Double getMrp() {
        return mrp;
    }

    public void setMrp(Double mrp) {
        this.mrp = mrp;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getStock() {
        return stock != null ? stock : 0;
    }

    public void setStock(Integer stock) {
        this.stock = stock != null ? stock : 0;
        // Auto-disable if stock = 0 (SmartBiz rule)
        if (this.stock == 0) {
            this.isActive = false;
        }
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold != null ? lowStockThreshold : 5;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public Boolean getIsActive() {
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive != null ? isActive : true;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public void setHsnCode(String hsnCode) {
        this.hsnCode = hsnCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Get product ID for JSON response (avoid lazy loading issues)
     */
    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getProductsId() : null;
    }
    
    /**
     * Get variant ID for JSON response
     */
    @JsonProperty("variantId")
    public Long getVariantIdForJson() {
        return variantId;
    }
    
    /**
     * Get selling price for JSON (alias for sellingPrice)
     */
    @JsonProperty("price")
    public Double getPriceForJson() {
        return sellingPrice;
    }
    
    /**
     * Get stock for JSON (alias for stock)
     */
    @JsonProperty("stock")
    public Integer getStockForJson() {
        return stock;
    }

    /**
     * Check if variant is in stock
     */
    public boolean isInStock() {
        return stock != null && stock > 0 && isActive != null && isActive;
    }

    /**
     * Check if variant is low stock
     */
    public boolean isLowStock() {
        return stock != null && stock > 0 && stock <= getLowStockThreshold();
    }
}
