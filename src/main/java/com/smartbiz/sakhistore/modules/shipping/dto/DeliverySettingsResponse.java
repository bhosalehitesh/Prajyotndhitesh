package com.smartbiz.sakhistore.modules.shipping.dto;

import lombok.Data;

/**
 * DTO for delivery settings response
 */
@Data
public class DeliverySettingsResponse {

    private Long settingsId;
    private Long storeId;

    // Delivery zones
    private Boolean enableLocalDelivery;
    private Boolean enableNationalDelivery;
    private Boolean enableInternationalDelivery;

    // Delivery charges
    private Double localDeliveryCharges;
    private Double nationalDeliveryCharges;
    private Double internationalDeliveryCharges;

    // Free delivery threshold
    private Double freeDeliveryThreshold;

    // Delivery time estimates (in days)
    private Integer localDeliveryDays;
    private Integer nationalDeliveryDays;
    private Integer internationalDeliveryDays;

    public DeliverySettingsResponse() {
    }
}

