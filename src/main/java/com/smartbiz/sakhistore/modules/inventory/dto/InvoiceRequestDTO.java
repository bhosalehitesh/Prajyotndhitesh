package com.smartbiz.sakhistore.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for invoice generation request
 */
@Data
public class InvoiceRequestDTO {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    // Optional: Invoice customization
    private String invoiceNumber; // Auto-generated if not provided
    private Boolean includeTaxBreakdown = true;
    private Boolean includePaymentDetails = true;
    private Boolean sendEmail = false;
    private String emailTo; // Override default user email

    public InvoiceRequestDTO() {
    }

    public InvoiceRequestDTO(Long orderId) {
        this.orderId = orderId;
    }

    // Validation helper
    public boolean isValid() {
        return orderId != null && orderId > 0;
    }
}

