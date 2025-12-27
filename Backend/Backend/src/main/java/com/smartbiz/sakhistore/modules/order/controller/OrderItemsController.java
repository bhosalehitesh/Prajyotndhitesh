package com.smartbiz.sakhistore.modules.order.controller;

import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.service.OrderItemsService;

import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin
public class OrderItemsController {

    private final OrderItemsService orderItemsService;

    public OrderItemsController(OrderItemsService orderItemsService) {
        this.orderItemsService = orderItemsService;
    }

    // ============================
    // GET ALL ORDER ITEMS
    // ============================
    @GetMapping("/all")
    public List<OrderItems> getAll() {
        return orderItemsService.getAllOrderItems();
    }

    // ============================
    // GET ORDER ITEMS BY ORDER ID
    // ============================
    @GetMapping("/order/{orderId}")
    public List<OrderItems> getByOrder(@PathVariable Long orderId) {
        return orderItemsService.getOrderItemsByOrder(orderId);
    }

    // ============================
    // GET ORDER ITEMS BY CART ID
    // ============================
    @GetMapping("/cart/{cartId}")
    public List<OrderItems> getByCart(@PathVariable Long cartId) {
        return orderItemsService.getOrderItemsByCart(cartId);
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

