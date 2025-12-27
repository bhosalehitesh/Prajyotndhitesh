package com.smartbiz.sakhistore.modules.order.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for order placement response
 */
@Data
public class PlaceOrderResponse {

    private Long orderId;
    private Double totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private LocalDateTime creationTime;
    private String message;
    private Boolean success;

    // Payment information
    private String paymentId;
    private String razorpayOrderId; // If using Razorpay

    public PlaceOrderResponse() {
    }

    public PlaceOrderResponse(Long orderId, Double totalAmount, String orderStatus, 
                              String paymentStatus, LocalDateTime creationTime) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.creationTime = creationTime;
        this.success = true;
        this.message = "Order placed successfully";
    }
}

