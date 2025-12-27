package com.smartbiz.sakhistore.modules.shipping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for delivery settings request
 */
@Data
public class DeliverySettingsRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    // Delivery zones
    private Boolean enableLocalDelivery = true;
    private Boolean enableNationalDelivery = true;
    private Boolean enableInternationalDelivery = false;

    // Delivery charges
    private Double localDeliveryCharges = 0.0;
    private Double nationalDeliveryCharges = 0.0;
    private Double internationalDeliveryCharges = 0.0;

    // Free delivery threshold
    private Double freeDeliveryThreshold;

    // Delivery time estimates (in days)
    private Integer localDeliveryDays = 1;
    private Integer nationalDeliveryDays = 3;
    private Integer internationalDeliveryDays = 7;

    public DeliverySettingsRequest() {
    }

    // Validation helper
    public boolean isValid() {
        return storeId != null && storeId > 0;
    }
}

