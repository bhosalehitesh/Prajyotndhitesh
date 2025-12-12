package com.smartbiz.sakhistore.modules.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderRequest;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderResponse;
import com.smartbiz.sakhistore.modules.payment.dto.RazorpayCallbackRequest;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;

@CrossOrigin("*")
@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Create razorpay order — frontend calls this to get order id + key
    @PostMapping("/create-razorpay-order")
    public ResponseEntity<CreateRazorpayOrderResponse> createRazorpayOrder(
            @RequestBody CreateRazorpayOrderRequest request) {
        try {
            CreateRazorpayOrderResponse resp = paymentService.createRazorpayOrder(request);
            return ResponseEntity.ok(resp);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Razorpay will redirect/post to this endpoint (or you can call from frontend)
    @PostMapping("/razorpay-callback")
    public ResponseEntity<?> razorpayCallback(@RequestBody RazorpayCallbackRequest callback) {
        try {
            Payment payment = paymentService.verifyAndUpdatePayment(callback);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Server-side capture (if payment_capture = 0)
    @PostMapping("/capture")
    public ResponseEntity<?> capture(@RequestParam String razorpayPaymentId, @RequestParam Double amount) {
        try {
            String resp = paymentService.capturePayment(razorpayPaymentId, amount);
            return ResponseEntity.ok(resp);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Refund API
    @PostMapping("/refund")
    public ResponseEntity<?> refund(@RequestParam String razorpayPaymentId, @RequestParam(required = false) Double amount) {
        try {
            String resp = paymentService.refundPayment(razorpayPaymentId, amount);
            return ResponseEntity.ok(resp);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Fetch payment details
    @GetMapping("/fetch/{razorpayPaymentId}")
    public ResponseEntity<?> fetchPayment(@PathVariable String razorpayPaymentId) {
        try {
            String resp = paymentService.fetchPayment(razorpayPaymentId);
            return ResponseEntity.ok(resp);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
