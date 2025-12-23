package com.smartbiz.sakhistore.modules.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.razorpay.RazorpayException;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;
import com.smartbiz.sakhistore.modules.payment.service.RazorpayService;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.order.model.Orders;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/payment", "/api/payment"})
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
            
            // Validate required fields
            if (request.get("razorpay_order_id") == null || request.get("razorpay_payment_id") == null || request.get("razorpay_signature") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing Razorpay identifiers in callback"));
            }
            if (request.get("orderId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing orderId in callback"));
            }

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

            // Get order first
            Orders order = null;
            try {
                order = ordersRepository.findById(orderId).orElse(null);
                if (order == null) {
                    System.err.println("⚠️ Order not found with ID: " + orderId);
                    return ResponseEntity.status(404).body(Map.of("error", "Order not found with id: " + orderId));
                }
                System.out.println("✅ Found order with ID: " + orderId + ", current payment status: " + order.getPaymentStatus());
            } catch (Exception e) {
                System.err.println("❌ Error finding order: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("error", "Error finding order: " + e.getMessage()));
            }
            
            // Check if payment already exists
            Payment existingPayment = paymentService.getPayment(razorpayPaymentId);
            
            if (existingPayment != null) {
                // Update existing payment with Razorpay details and status
                System.out.println("✅ Found existing payment, updating to PAID");
                paymentService.markPaymentPaidWithRazorpayDetails(razorpayPaymentId, razorpayOrderId, razorpaySignature);
            } else {
                // Create new payment
                Double amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
                System.out.println("📝 Creating new payment for order ID: " + orderId + ", amount: " + amount);
                
                // Create payment (this will set status to PENDING initially)
                Payment newPayment = paymentService.createPayment(orderId, amount, razorpayPaymentId);
                System.out.println("✅ Payment created with ID: " + newPayment.getPaymentAutoId());
                
                // Now mark as paid and store Razorpay fields (this will update both payment and order)
                System.out.println("✅ Marking payment as PAID");
                paymentService.markPaymentPaidWithRazorpayDetails(razorpayPaymentId, razorpayOrderId, razorpaySignature);
            }
            
            // Final verification: Reload order and ensure it's PAID
            try {
                Orders updatedOrder = ordersRepository.findById(orderId).orElse(null);
                if (updatedOrder != null) {
                    System.out.println("🔍 Final verification - Order payment status: " + updatedOrder.getPaymentStatus());
                    if (updatedOrder.getPaymentStatus() != com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.PAID) {
                        System.err.println("⚠️ WARNING: Order payment status is still not PAID! Force updating...");
                        updatedOrder.setPaymentStatus(com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.PAID);
                        ordersRepository.save(updatedOrder);
                        System.out.println("✅ Force updated order payment status to PAID");
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ Error in final verification: " + e.getMessage());
                e.printStackTrace();
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

    // ==========================================
    // Mark Payment as Failed (when user cancels)
    // ==========================================
    @PostMapping("/mark-failed")
    public ResponseEntity<?> markPaymentFailed(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received payment cancellation request: " + request);
            
            if (request.get("orderId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing orderId in request"));
            }

            Long orderId = Long.parseLong(request.get("orderId").toString());
            
            // Find the order
            Orders order = ordersRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.err.println("⚠️ Order not found with ID: " + orderId);
                return ResponseEntity.status(404).body(Map.of("error", "Order not found with id: " + orderId));
            }

            System.out.println("✅ Found order with ID: " + orderId + ", current payment status: " + order.getPaymentStatus());
            
            // Update order payment status to FAILED
            order.setPaymentStatus(com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.FAILED);
            ordersRepository.save(order);
            System.out.println("✅ Updated order payment status to FAILED");

            // Also update payment entity if it exists
            try {
                // Try to find payment by order
                com.smartbiz.sakhistore.modules.payment.model.Payment payment = 
                    paymentService.getPaymentByOrderId(orderId);
                if (payment != null) {
                    payment.setStatus(com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.FAILED);
                    paymentService.savePayment(payment);
                    System.out.println("✅ Updated payment entity status to FAILED");
                } else {
                    System.out.println("ℹ️ No payment entity found for order ID: " + orderId + " (this is normal if payment was never created)");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Could not update payment entity: " + e.getMessage());
                e.printStackTrace();
                // Continue even if payment entity update fails - don't throw exception
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment marked as failed",
                "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error marking payment as failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark payment as failed: " + e.getMessage()));
        }
    }
}
