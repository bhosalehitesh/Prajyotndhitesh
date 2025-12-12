package com.smartbiz.sakhistore.modules.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.razorpay.RazorpayException;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderRequest;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderResponse;
import com.smartbiz.sakhistore.modules.payment.dto.RazorpayCallbackRequest;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;
import com.smartbiz.sakhistore.modules.payment.service.RazorpayService;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.order.model.Orders;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private OrdersRepository ordersRepository;

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
    // Handle OPTIONS for CORS preflight
    // ==========================================
    @RequestMapping(value = "/create-razorpay-order", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Create Razorpay Order (using RazorpayService)
    // ==========================================
    @PostMapping(value = "/create-razorpay-order", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received request to create Razorpay order: " + request);
            
            Long orderId = Long.parseLong(request.get("orderId").toString());
            Double amount = Double.parseDouble(request.get("amount").toString());

            System.out.println("Creating order with orderId: " + orderId + ", amount: " + amount);
            Map<String, Object> orderResponse = razorpayService.createOrder(amount, orderId);
            System.out.println("Razorpay order created: " + orderResponse);
            
            return ResponseEntity.ok(orderResponse);
        } catch (RazorpayException e) {
            e.printStackTrace();
            System.err.println("Razorpay error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create Razorpay order: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("General error: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Invalid request: " + e.getMessage()));
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

    // ==========================================
    // Handle OPTIONS for CORS preflight (callback)
    // ==========================================
    @RequestMapping(value = "/razorpay-callback", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleCallbackOptions() {
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Razorpay Payment Callback (using Map-based request)
    // ==========================================
    @PostMapping(value = "/razorpay-callback", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> razorpayCallback(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received Razorpay callback: " + request);
            
            String razorpayOrderId = request.get("razorpay_order_id").toString();
            String razorpayPaymentId = request.get("razorpay_payment_id").toString();
            String razorpaySignature = request.get("razorpay_signature").toString();
            Long orderId = Long.parseLong(request.get("orderId").toString());

            // Verify signature
            boolean isValid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (!isValid) {
                System.err.println("Invalid payment signature");
                return ResponseEntity.status(400).body(Map.of("error", "Invalid payment signature"));
            }

            // Check if payment already exists
            Payment existingPayment = paymentService.getPayment(razorpayPaymentId);
            
            if (existingPayment != null) {
                // Update existing payment status to PAID
                paymentService.updatePaymentStatus(razorpayPaymentId, PaymentStatus.PAID);
            } else {
                // Get order to get amount (or use 0.0 if order doesn't exist for testing)
                Double amount = 0.0;
                Orders order = null;
                try {
                    order = ordersRepository.findById(orderId).orElse(null);
                    if (order != null) {
                        amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
                    }
                } catch (Exception e) {
                    // Order might not exist, use default amount
                    System.out.println("Order not found, using default amount: " + e.getMessage());
                }
                
                // Create payment - with order if exists, without if not (for testing)
                Payment payment;
                if (order != null) {
                    payment = paymentService.createPayment(orderId, amount, razorpayPaymentId);
                } else {
                    // For testing: create payment without order requirement
                    // Get amount from request if available
                    try {
                        Object amountObj = request.get("amount");
                        if (amountObj != null) {
                            amount = Double.parseDouble(amountObj.toString());
                        }
                    } catch (Exception e) {
                        // Use default 0.0
                    }
                    payment = paymentService.createPaymentWithoutOrder(amount, razorpayPaymentId);
                }
                
                // Update status to PAID
                paymentService.updatePaymentStatus(razorpayPaymentId, PaymentStatus.PAID);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified and saved",
                "paymentId", razorpayPaymentId,
                "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Callback error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process callback: " + e.getMessage()));
        }
    }
}
