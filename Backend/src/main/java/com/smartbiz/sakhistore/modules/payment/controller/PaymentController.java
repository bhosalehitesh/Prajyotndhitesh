package com.smartbiz.sakhistore.modules.payment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;
@CrossOrigin("*")
@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ==========================================
    // Create a new payment before starting UPI/Card processing
    // ==========================================
    @PostMapping("/create")
    public Payment createPayment(
            @RequestParam Long orderId,
            @RequestParam Double amount,
            @RequestParam String paymentId   // razorpayPaymentId / stripeChargeId / transactionId
    ) {
        return paymentService.createPayment(orderId, amount, paymentId);
    }

    // ==========================================
    // Update Payment Status (SUCCESS / FAILED / PENDING)
    // ==========================================
    @PutMapping("/update-status")
    public Payment updateStatus(
            @RequestParam String paymentId,
            @RequestParam PaymentStatus status
    ) {
        return paymentService.updatePaymentStatus(paymentId, status);
    }

    // ==========================================
    // Get Payment Details
    // ==========================================
    @GetMapping("/{paymentId}")
    public Payment getPayment(@PathVariable String paymentId) {
        return paymentService.getPayment(paymentId);
    }
}
