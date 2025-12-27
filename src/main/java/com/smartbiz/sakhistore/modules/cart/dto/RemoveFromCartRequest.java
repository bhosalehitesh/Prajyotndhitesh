package com.smartbiz.sakhistore.modules.cart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for removing items from cart
 * Supports both productId (legacy) and variantId (preferred)
 */
@Data
public class RemoveFromCartRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    // Preferred: Use variantId for explicit variant removal
    private Long variantId;

    // Legacy: Use productId (will remove all variants of product)
    private Long productId;

    public RemoveFromCartRequest() {
    }

    public RemoveFromCartRequest(Long userId, Long variantId, Long productId) {
        this.userId = userId;
        this.variantId = variantId;
        this.productId = productId;
    }

    // Validation helper
    public boolean isValid() {
        return variantId != null || productId != null;
    }
}

