package com.smartbiz.sakhistore.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * DTO for placing an order from cart
 */
@Data
public class PlaceOrderRequest {

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Mobile number is required")
    @Positive(message = "Mobile number must be valid")
    private Long mobile;

    // Optional: Store and Seller IDs
    private Long storeId;
    private Long sellerId;

    public PlaceOrderRequest() {
    }

    public PlaceOrderRequest(Long userId, String address, Long mobile) {
        this.userId = userId;
        this.address = address;
        this.mobile = mobile;
    }

    // Validation helper
    public boolean isValid() {
        return userId != null && userId > 0 
            && address != null && !address.trim().isEmpty()
            && mobile != null && mobile > 0;
    }
}

