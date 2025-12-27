package com.smartbiz.sakhistore.modules.shipping.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for shipping details response
 */
@Data
public class ShippingResponseDTO {

    private Long shippingId;
    private Long orderId;
    private String shippingAddress;
    private String pincode;
    private String city;
    private String state;
    private String country;

    // Shipping method
    private String shippingMethod;
    private Double shippingCharges;

    // Tracking information
    private String trackingNumber;
    private String carrier;
    private String estimatedDeliveryDate;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    // Contact information
    private String contactName;
    private String contactPhone;

    // Status
    private String shippingStatus; // PENDING, SHIPPED, IN_TRANSIT, DELIVERED, FAILED

    public ShippingResponseDTO() {
    }
}

