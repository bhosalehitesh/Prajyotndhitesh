package com.smartbiz.sakhistore.modules.order.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for complete order response
 */
@Data
public class OrderResponseDTO {

    private Long orderId;
    private Double totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private LocalDateTime creationTime;
    private Long mobile;
    private String address;
    private String rejectionReason; // If order was rejected

    // Customer information
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Store and Seller information
    private Long storeId;
    private Long sellerId;

    // Order items
    private List<OrderItemResponseDTO> orderItems;

    // Payment information
    private String paymentId;
    private String paymentMethod;

    // Summary
    private Integer totalItems;
    private Double subtotal;
    private Double taxAmount;
    private Double discountAmount;
    private Double deliveryCharges;
    private Double grandTotal;

    public OrderResponseDTO() {
    }

    // Calculate summary
    public void calculateSummary() {
        if (orderItems != null) {
            this.totalItems = orderItems.stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            
            this.subtotal = orderItems.stream()
                    .mapToDouble(item -> item.getTotalPrice() != null ? item.getTotalPrice() : 0.0)
                    .sum();
        }
        
        // Grand total defaults to totalAmount if not calculated
        if (grandTotal == null && totalAmount != null) {
            grandTotal = totalAmount;
        }
    }
}

