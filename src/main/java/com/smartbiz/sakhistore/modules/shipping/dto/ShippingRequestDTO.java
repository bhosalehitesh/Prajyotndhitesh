package com.smartbiz.sakhistore.modules.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for shipping details request
 */
@Data
public class ShippingRequestDTO {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String city;
    private String state;
    private String country = "India"; // Default

    // Shipping method
    private String shippingMethod; // STANDARD, EXPRESS, SAME_DAY
    private Double shippingCharges;

    // Contact information
    private String contactName;
    private String contactPhone;

    public ShippingRequestDTO() {
    }

    // Validation helper
    public boolean isValid() {
        return orderId != null && orderId > 0
            && shippingAddress != null && !shippingAddress.trim().isEmpty()
            && pincode != null && !pincode.trim().isEmpty();
    }
}

