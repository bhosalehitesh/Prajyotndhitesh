package com.smartbiz.sakhistore.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for updating order status
 */
@Data
public class UpdateOrderStatusRequest {

    @NotBlank(message = "Order status is required")
    private String orderStatus; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REJECTED

    private String rejectionReason; // Required if status is REJECTED

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public UpdateOrderStatusRequest(String orderStatus, String rejectionReason) {
        this.orderStatus = orderStatus;
        this.rejectionReason = rejectionReason;
    }

    // Validation helper
    public boolean isValid() {
        if (orderStatus == null || orderStatus.trim().isEmpty()) {
            return false;
        }
        // If status is REJECTED, rejectionReason should be provided
        if ("REJECTED".equalsIgnoreCase(orderStatus) && 
            (rejectionReason == null || rejectionReason.trim().isEmpty())) {
            return false;
        }
        return true;
    }
}

