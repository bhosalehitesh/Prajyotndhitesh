package com.smartbiz.sakhistore.modules.order.dto;

import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility to convert Order entities to DTOs
 */
@Component
public class OrderMapper {

    /**
     * Convert Orders entity to OrderResponseDTO
     */
    public OrderResponseDTO toOrderResponseDTO(Orders order) {
        if (order == null) {
            return null;
        }
        
        // Validate that order has a valid ID
        if (order.getOrdersId() == null || order.getOrdersId() <= 0) {
            System.err.println("⚠️ [OrderMapper] Skipping order with invalid ID: " + order.getOrdersId());
            return null;
        }

        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrdersId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus() != null ? order.getOrderStatus().name() : null);
        dto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        dto.setCreationTime(order.getCreationTime());
        dto.setMobile(order.getMobile());
        dto.setAddress(order.getAddress());
        dto.setRejectionReason(order.getRejectionReason());

        // Customer information
        dto.setCustomerId(order.getCustomerId());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setCustomerEmail(order.getCustomerEmail());

        // Store and Seller information
        dto.setStoreId(order.getStoreId());
        dto.setSellerId(order.getSellerId());

        // Payment information
        if (order.getPayment() != null) {
            dto.setPaymentId(order.getPayment().getPaymentId());
            // Payment model doesn't have paymentMethod field, using status instead
            dto.setPaymentMethod(order.getPayment().getStatus() != null 
                ? order.getPayment().getStatus().name() : null);
        }

        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream()
                    .map(this::toOrderItemResponseDTO)
                    .collect(Collectors.toList());
            dto.setOrderItems(itemDTOs);
        }

        // Calculate summary
        dto.calculateSummary();

        return dto;
    }

    /**
     * Convert OrderItems entity to OrderItemResponseDTO
     */
    public OrderItemResponseDTO toOrderItemResponseDTO(OrderItems item) {
        if (item == null) {
            return null;
        }

        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setOrderItemsId(item.getOrderItemsId());
        dto.setQuantity(item.getQuantity());
        
        // DO NOT set dto.setPrice(item.getPrice()) because OrderItems.price is already total (unitPrice * quantity)
        // Instead, get unit price directly from product/variant in database

        // Get unit price directly from database: prefer variant price, fallback to product price
        Double unitPrice = null;
        if (item.getVariant() != null && item.getVariant().getSellingPrice() != null) {
            unitPrice = item.getVariant().getSellingPrice();
        } else if (item.getProduct() != null && item.getProduct().getSellingPrice() != null) {
            unitPrice = item.getProduct().getSellingPrice();
        }
        
        // Set unit price (from database)
        if (unitPrice != null) {
            dto.setUnitPrice(unitPrice);
        }
        
        // Set price field to unit price (for backward compatibility, but unitPrice should be used)
        if (unitPrice != null) {
            dto.setPrice(unitPrice);
        }

        // Product information
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getProductsId());
            dto.setProductName(item.getProduct().getProductName());
            dto.setProductDescription(item.getProduct().getDescription());
            dto.setProductImages(item.getProduct().getProductImages());
            dto.setProductMrp(item.getProduct().getMrp());
            dto.setProductSellingPrice(item.getProduct().getSellingPrice());
        }

        // Variant information (preferred)
        if (item.getVariant() != null) {
            dto.setVariantId(item.getVariant().getVariantId());
            
            // Extract color and size from attributes JSON
            java.util.Map<String, String> attributes = item.getVariant().getAttributes();
            if (attributes != null) {
                dto.setVariantColor(attributes.get("color"));
                dto.setVariantSize(attributes.get("size"));
            }
            
            dto.setVariantStock(item.getVariant().getStock());
        }

        // Calculate total price using unitPrice * quantity
        dto.calculateTotalPrice();

        return dto;
    }

    /**
     * Convert list of Orders to list of OrderResponseDTO
     * Filters out orders with NULL or invalid OrdersId to prevent serialization issues
     */
    public List<OrderResponseDTO> toOrderResponseDTOList(List<Orders> orders) {
        if (orders == null) {
            return new ArrayList<>();
        }
        return orders.stream()
                .filter(order -> order != null && order.getOrdersId() != null && order.getOrdersId() > 0)
                .map(this::toOrderResponseDTO)
                .filter(dto -> dto != null) // Filter out null DTOs as extra safety
                .collect(Collectors.toList());
    }
}

