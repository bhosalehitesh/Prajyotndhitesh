package com.smartbiz.sakhistore.modules.inventory.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for invoice response
 */
@Data
public class InvoiceResponseDTO {

    private Long invoiceId;
    private String invoiceNumber;
    private LocalDateTime invoiceDate;

    // Order information
    private Long orderId;
    private String orderStatus;

    // Customer information
    private Long userId;
    private String userName;
    private String userPhone;
    private String userEmail;

    // Addresses
    private String billingAddress;
    private String shippingAddress;

    // Totals
    private Double subTotal;
    private Double taxAmount;
    private Double discountAmount;
    private Double deliveryCharges;
    private Double grandTotal;

    // Payment information
    private Long paymentId;
    private String paymentMethod;
    private String paymentStatus;
    private Double paymentAmount;

    // Invoice items
    private List<InvoiceItemResponseDTO> items;

    // PDF information
    private String pdfPath;
    private String pdfUrl; // Public URL if stored in cloud
    private String status; // PENDING, GENERATED, SENT, FAILED

    public InvoiceResponseDTO() {
    }
}

