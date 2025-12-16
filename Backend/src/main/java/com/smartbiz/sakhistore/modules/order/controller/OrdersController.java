package com.smartbiz.sakhistore.modules.order.controller;

import com.smartbiz.sakhistore.modules.order.model.OrderStatus;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.service.OrdersService;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrdersController {

    @Autowired
    private OrdersService ordersService;

    // ===============================
    // Place Order From Cart
    // ===============================
    @PostMapping("/place")
    public Orders placeOrder(
            @RequestParam Long userId,
            @RequestParam String address,
            @RequestParam Long mobile,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long sellerId
    ) {
        User user = new User();
        user.setId(userId);

        return ordersService.placeOrder(user, address, mobile, storeId, sellerId);
    }

    // ===============================
    // Get Order Details
    // ===============================
    @GetMapping("/{id}")
    public Orders getOrder(@PathVariable Long id) {
        return ordersService.getOrder(id);
    }

    // ===============================
    // Get All Orders of a User
    // ===============================
    @GetMapping("/user/{userId}")
    public List<Orders> getUserOrders(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        return ordersService.getOrdersByUser(user);
    }

    // ===============================
    // Update Order Status
    // ===============================
    @PutMapping("/update-status/{id}")
    public Orders updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return ordersService.updateOrderStatus(id, status);
    }

    // ===============================
    // Get Orders by Seller ID
    // Returns all orders containing products from this seller
    // Includes customer information (user details)
    // ===============================
    @GetMapping("/seller/{sellerId}")
    public List<Orders> getSellerOrders(@PathVariable Long sellerId) {
        return ordersService.getOrdersBySellerId(sellerId);
    }
}
