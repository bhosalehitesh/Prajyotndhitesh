package com.smartbiz.sakhistore.modules.order.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for paginated list of orders
 */
@Data
public class OrderListResponseDTO {

    private List<OrderResponseDTO> orders;
    private Integer totalOrders;
    private Integer pageNumber;
    private Integer pageSize;
    private Integer totalPages;
    private Boolean hasNext;
    private Boolean hasPrevious;

    public OrderListResponseDTO() {
    }

    public OrderListResponseDTO(List<OrderResponseDTO> orders, Integer totalOrders, 
                                Integer pageNumber, Integer pageSize) {
        this.orders = orders;
        this.totalOrders = totalOrders;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        
        // Calculate pagination metadata
        if (pageSize != null && pageSize > 0) {
            this.totalPages = (int) Math.ceil((double) totalOrders / pageSize);
            this.hasNext = pageNumber < totalPages;
            this.hasPrevious = pageNumber > 1;
        }
    }
}

