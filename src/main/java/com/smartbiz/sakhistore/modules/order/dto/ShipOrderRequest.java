package com.smartbiz.sakhistore.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for shipping an order
 */
@Data
public class ShipOrderRequest {

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;

    private String carrier; // Shipping carrier name (e.g., "FedEx", "DHL", "India Post")
    private String estimatedDeliveryDate; // ISO date string
    private String shippingNotes; // Additional notes

    public ShipOrderRequest() {
    }

    public ShipOrderRequest(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    // Validation helper
    public boolean isValid() {
        return trackingNumber != null && !trackingNumber.trim().isEmpty();
    }
}

