package com.smartbiz.sakhistore.modules.inventory.dto;

import lombok.Data;

/**
 * DTO for inventory response
 */
@Data
public class InventoryResponseDTO {

    private Long inventoryId;
    private Long productId;
    private String productName;

    // Variant information (if applicable)
    private Long variantId;
    private String variantColor;
    private String variantSize;

    // Stock information
    private Integer currentStock;
    private Integer reservedStock; // Stock reserved in pending orders
    private Integer availableStock; // currentStock - reservedStock

    // Status
    private Boolean inStock;
    private Boolean lowStock; // Below threshold
    private Integer lowStockThreshold = 10; // Default threshold

    // Metadata
    private String lastUpdated;
    private String notes;

    public InventoryResponseDTO() {
    }

    // Calculate available stock
    public void calculateAvailableStock() {
        if (currentStock != null && reservedStock != null) {
            this.availableStock = Math.max(0, currentStock - reservedStock);
        } else if (currentStock != null) {
            this.availableStock = currentStock;
        }
        
        // Update inStock status
        this.inStock = availableStock != null && availableStock > 0;
        
        // Update lowStock status
        if (availableStock != null && lowStockThreshold != null) {
            this.lowStock = availableStock <= lowStockThreshold;
        }
    }
}

