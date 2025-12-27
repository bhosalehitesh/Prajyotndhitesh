package com.smartbiz.sakhistore.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for updating cart item quantities
 * Supports both productId (legacy) and variantId (preferred)
 */
@Data
public class UpdateCartRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    // Preferred: Use variantId for explicit variant selection
    private Long variantId;

    // Legacy: Use productId (will update first variant of product)
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be 0 or greater (0 removes item)")
    private Integer quantity;

    public UpdateCartRequest() {
    }

    public UpdateCartRequest(Long userId, Long variantId, Long productId, Integer quantity) {
        this.userId = userId;
        this.variantId = variantId;
        this.productId = productId;
        this.quantity = quantity;
    }

    // Validation helper
    public boolean isValid() {
        return (variantId != null || productId != null) && quantity != null;
    }
}

