package com.smartbiz.sakhistore.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for inventory update request
 */
@Data
public class InventoryRequestDTO {

    @NotNull(message = "Product ID is required")
    private Long productId;

    // For variant-based inventory
    private Long variantId;

    // Inventory update
    private Integer quantityChange; // Positive to add, negative to subtract
    private Integer newQuantity; // Set to specific quantity

    // Notes
    private String notes;
    private String reason; // RESTOCK, SALE, RETURN, DAMAGED, etc.

    public InventoryRequestDTO() {
    }

    public InventoryRequestDTO(Long productId, Integer quantityChange) {
        this.productId = productId;
        this.quantityChange = quantityChange;
    }

    // Validation helper
    public boolean isValid() {
        return productId != null && productId > 0
            && (quantityChange != null || newQuantity != null);
    }
}

