package com.smartbiz.sakhistore.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for adding items to cart
 * Supports both productId (legacy) and variantId (preferred)
 */
@Data
public class AddToCartRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    // Preferred: Use variantId for explicit variant selection
    private Long variantId;

    // Legacy: Use productId (will auto-select first variant)
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public AddToCartRequest() {
    }

    public AddToCartRequest(Long userId, Long variantId, Long productId, Integer quantity) {
        this.userId = userId;
        this.variantId = variantId;
        this.productId = productId;
        this.quantity = quantity;
    }

    // Validation helper
    public boolean isValid() {
        return (variantId != null || productId != null) && quantity != null && quantity > 0;
    }
}

