package com.smartbiz.sakhistore.modules.inventory.dto;

import com.smartbiz.sakhistore.modules.inventory.model.Inventory;
import com.smartbiz.sakhistore.modules.inventory.model.UserInvoice;
import com.smartbiz.sakhistore.modules.inventory.model.InvoiceItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility to convert Inventory and Invoice entities to DTOs
 */
@Component
public class InventoryMapper {

    /**
     * Convert Inventory entity to InventoryResponseDTO
     */
    public InventoryResponseDTO toInventoryResponseDTO(Inventory inventory) {
        if (inventory == null) {
            return null;
        }

        InventoryResponseDTO dto = new InventoryResponseDTO();
        dto.setInventoryId(inventory.getInventoryId());

        // Product information
        if (inventory.getProduct() != null) {
            dto.setProductId(inventory.getProduct().getProductsId());
            dto.setProductName(inventory.getProduct().getProductName());
        }

        // Note: Inventory model doesn't have variant or stock fields directly
        // You may need to adjust this based on your actual Inventory model structure

        // Calculate available stock
        dto.calculateAvailableStock();

        return dto;
    }

    /**
     * Convert UserInvoice entity to InvoiceResponseDTO
     */
    public InvoiceResponseDTO toInvoiceResponseDTO(UserInvoice invoice) {
        if (invoice == null) {
            return null;
        }

        InvoiceResponseDTO dto = new InvoiceResponseDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setOrderId(invoice.getOrderId());
        dto.setUserId(invoice.getUserId());
        dto.setPaymentId(invoice.getPaymentId());
        dto.setUserName(invoice.getUserName());
        dto.setUserPhone(invoice.getUserPhone());
        dto.setUserEmail(invoice.getUserEmail());
        dto.setBillingAddress(invoice.getBillingAddress());
        dto.setShippingAddress(invoice.getShippingAddress());
        dto.setSubTotal(invoice.getSubTotal());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setDeliveryCharges(invoice.getDeliveryCharges());
        dto.setGrandTotal(invoice.getGrandTotal());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setPaymentStatus(invoice.getPaymentStatus());
        dto.setPaymentAmount(invoice.getPaymentAmount());
        dto.setPdfPath(invoice.getPdfPath());
        dto.setStatus(invoice.getStatus() != null ? invoice.getStatus().name() : null);

        // Convert invoice items
        if (invoice.getItems() != null) {
            List<InvoiceItemResponseDTO> itemDTOs = invoice.getItems().stream()
                    .map(this::toInvoiceItemResponseDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        return dto;
    }

    /**
     * Convert InvoiceItem entity to InvoiceItemResponseDTO
     */
    public InvoiceItemResponseDTO toInvoiceItemResponseDTO(InvoiceItem item) {
        if (item == null) {
            return null;
        }

        InvoiceItemResponseDTO dto = new InvoiceItemResponseDTO();
        dto.setItemId(item.getItemId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getPrice());
        dto.setTaxAmount(item.getGstAmount());
        dto.setDiscountAmount(0.0); // InvoiceItem doesn't have discount field

        // Variant information (size is stored directly)
        dto.setVariantSize(item.getSize());

        // Calculate total price
        dto.setTotalPrice(item.getTotal());

        return dto;
    }
}

