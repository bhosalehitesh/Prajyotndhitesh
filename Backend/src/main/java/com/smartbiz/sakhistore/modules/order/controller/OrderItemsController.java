package com.smartbiz.sakhistore.modules.order.controller;

import com.smartbiz.sakhistore.modules.order.dto.*;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.service.OrderItemsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin
public class OrderItemsController {

    private final OrderItemsService orderItemsService;
    
    @Autowired
    private OrderMapper orderMapper;

    public OrderItemsController(OrderItemsService orderItemsService) {
        this.orderItemsService = orderItemsService;
    }

    // ============================
    // GET ALL ORDER ITEMS (Using DTO)
    // ============================
    @GetMapping("/all")
    public ResponseEntity<List<OrderItemResponseDTO>> getAll() {
        List<OrderItems> items = orderItemsService.getAllOrderItems();
        List<OrderItemResponseDTO> itemDTOs = items.stream()
                .map(orderMapper::toOrderItemResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(itemDTOs);
    }

    // ============================
    // GET ORDER ITEMS BY ORDER ID (Using DTO)
    // ============================
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemResponseDTO>> getByOrder(@PathVariable Long orderId) {
        List<OrderItems> items = orderItemsService.getOrderItemsByOrder(orderId);
        List<OrderItemResponseDTO> itemDTOs = items.stream()
                .map(orderMapper::toOrderItemResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(itemDTOs);
    }

    // ============================
    // GET ORDER ITEMS BY CART ID (Using DTO)
    // ============================
    @GetMapping("/cart/{cartId}")
    public ResponseEntity<List<OrderItemResponseDTO>> getByCart(@PathVariable Long cartId) {
        List<OrderItems> items = orderItemsService.getOrderItemsByCart(cartId);
        List<OrderItemResponseDTO> itemDTOs = items.stream()
                .map(orderMapper::toOrderItemResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(itemDTOs);
    }

    // ============================
    // CREATE ORDER ITEM
    // ============================
    @PostMapping("/create")
    public OrderItems create(@RequestParam Long productId,
                             @RequestParam Long cartId,
                             @RequestParam Integer quantity) {

        return orderItemsService.createOrderItem(productId, cartId, quantity);
    }

    // ============================
    // UPDATE ORDER ITEM
    // ============================
    @PutMapping("/update/{itemId}")
    public OrderItems update(@PathVariable Long itemId,
                             @RequestParam Integer quantity) {

        return orderItemsService.updateOrderItem(itemId, quantity);
    }

    // ============================
    // DELETE ORDER ITEM
    // ============================
    @DeleteMapping("/delete/{itemId}")
    public String delete(@PathVariable Long itemId) {
        orderItemsService.deleteOrderItem(itemId);
        return "Order item deleted successfully!";
    }
}

