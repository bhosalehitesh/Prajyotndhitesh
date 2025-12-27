package com.smartbiz.sakhistore.modules.admin.controller;
/*
import java.util.Map;

import com.smartbiz.sakhistore.modules.seller.service.SellerDetailsService1;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.smartbiz.sakhistore.modules.customer_user.model.*;
import com.smartbiz.sakhistore.modules.order.service.OrdersService;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.SellerDetailsService;
import com.smartbiz.sakhistore.modules.admin.service.AdminService;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.order.model.Orders;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    public AdminService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestParam String username,
                                        @RequestParam String password) {

        if (adminAuthService.validateAdmin(username, password)) {
            return ResponseEntity.ok("Admin Login Successful!");
        } else {
            return ResponseEntity.status(401).body("Invalid Admin Credentials");
        }
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Admin, this is your dashboard!";
    }

    @Autowired
    private SellerDetailsService1 sellerService;

    @Autowired
    private OrdersService ordersService;

    @Autowired
    private PaymentService paymentService;

    // ======================================================
    // DELETE SELLER (SUPER ADMIN ONLY)
    // ======================================================
    @DeleteMapping("/seller/{sellerId}")
    public ResponseEntity<String> deleteSeller(@PathVariable Long sellerId) {
        sellerService.deleteSeller(sellerId);
        return ResponseEntity.ok("Seller Deleted Successfully!");
    }

    // ======================================================
    // VIEW ALL ORDERS (SUPER ADMIN)
    // ======================================================
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(ordersService.getAllOrders());
    }

    // ======================================================
    // VIEW ORDER BY ID
    // ======================================================
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(ordersService.getOrder(orderId));
    }

    // ======================================================
    // VIEW ALL PAYMENTS
    // ======================================================
    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // ======================================================
    // VIEW PAYMENT BY PAYMENT-ID
    // ======================================================
    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<?> getPaymentById(@PathVariable String paymentId) {
        return ResponseEntity.ok(paymentService.getPayment(paymentId));
    }


    // ======================================================
    // GET ONLY ORDER STATUS (SUPER ADMIN)
    // ======================================================
    @GetMapping("/orders/status/{orderId}")
    public ResponseEntity<?> getOrderStatus(@PathVariable Long orderId) {
        Orders order = ordersService.getOrder(orderId);
        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "orderStatus", order.getOrderStatus(),
                "paymentStatus", order.getPaymentStatus()
        ));
    }

    // ======================================================
    // GET ONLY PAYMENT STATUS (SUPER ADMIN)
    // ======================================================
    @GetMapping("/payments/status/{paymentId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String paymentId) {
        Payment payment = paymentService.getPayment(paymentId);
        return ResponseEntity.ok(Map.of(
                "paymentId", paymentId,
                "paymentStatus", payment.getStatus()
        ));
    }

}*/
