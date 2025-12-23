package com.smartbiz.sakhistore.modules.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.razorpay.RazorpayException;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.payment.repository.PaymentRepository;
import com.smartbiz.sakhistore.modules.payment.service.PaymentService;
import com.smartbiz.sakhistore.modules.payment.service.RazorpayService;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.order.model.Orders;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({ "/api/payment", "/payment" })
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // ==========================================
    // Create a new payment before starting UPI/Card processing
    // ==========================================
    @PostMapping("/create")
    public Payment createPayment(
            @RequestParam Long orderId,
            @RequestParam Double amount,
            @RequestParam String paymentId // razorpayPaymentId / stripeChargeId / transactionId
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
            System.out.println("\n" + "=".repeat(70));
            System.out.println("🛒 CREATING RAZORPAY ORDER");
            System.out.println("=".repeat(70));
            System.out.println("Received request: " + request);

            Long orderId = Long.parseLong(request.get("orderId").toString());
            Double amount = Double.parseDouble(request.get("amount").toString());

            System.out.println("Order ID: " + orderId);
            System.out.println("Amount: " + amount);

            // Verify order exists (quick check)
            Orders order = ordersRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.err.println("❌ Order #" + orderId + " not found in database");
                return ResponseEntity.status(404).body(Map.of("error", "Order not found with id: " + orderId));
            }
            System.out.println("✅ Order #" + orderId + " found in database");

            // Create Razorpay order (this might take a few seconds - external API call)
            System.out.println("📞 Calling Razorpay API to create order...");
            long startTime = System.currentTimeMillis();
            Map<String, Object> orderResponse;
            try {
                orderResponse = razorpayService.createOrder(amount, orderId);
                long duration = System.currentTimeMillis() - startTime;
                System.out.println("⏱️ Razorpay API call completed in " + duration + "ms");
            } catch (com.razorpay.RazorpayException e) {
                long duration = System.currentTimeMillis() - startTime;
                System.err.println("❌ Razorpay API error after " + duration + "ms: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of(
                        "error", "Failed to create Razorpay order",
                        "message", e.getMessage(),
                        "details",
                        "Please check Razorpay credentials and network connection. If this persists, check Razorpay service status."));
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                System.err.println("❌ Unexpected error after " + duration + "ms: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of(
                        "error", "Failed to create Razorpay order",
                        "message", e.getMessage()));
            }

            String razorpayOrderId = orderResponse.get("razorpayOrderId").toString();
            System.out.println("✅ Razorpay order created: " + razorpayOrderId);

            // CRITICAL: Create Payment record and link it to the order
            // This ensures the callback can find the payment later
            // Do this quickly without blocking
            try {
                Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                if (payment == null) {
                    // Create new payment record
                    payment = new Payment();
                    payment.setAmount(amount);
                    payment.setPaymentId("PAY-" + System.currentTimeMillis());
                    payment.setStatus(PaymentStatus.PENDING);
                    payment.setOrders(order);
                    payment.setRazorpayOrderId(razorpayOrderId);
                    payment = paymentRepository.save(payment);
                    System.out.println("✅ Payment record created and linked to order #" + orderId);
                    System.out.println("   Payment ID: " + payment.getPaymentAutoId());
                } else {
                    System.out.println("⚠️ Payment record already exists for Razorpay Order ID: " + razorpayOrderId);
                }
            } catch (Exception e) {
                // Don't fail the request if payment record creation fails
                // The callback can create it if needed
                System.err.println("⚠️ Warning: Could not create payment record: " + e.getMessage());
                System.err.println("   Callback will handle payment record creation");
            }

            System.out.println("=".repeat(70) + "\n");

            return ResponseEntity.ok(orderResponse);
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
    public ResponseEntity<?> refund(@RequestParam String razorpayPaymentId,
            @RequestParam(required = false) Double amount) {
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
        // Declare orderIdFromRequest outside try block so it's accessible in catch
        // block
        Long orderIdFromRequest = null;

        try {
            System.out.println("\n" + "=".repeat(70));
            System.out.println("📞 RAZORPAY CALLBACK RECEIVED");
            System.out.println("=".repeat(70));
            System.out.println("Full request: " + request);

            // Validate required fields
            if (request.get("razorpay_order_id") == null || request.get("razorpay_payment_id") == null
                    || request.get("razorpay_signature") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing Razorpay identifiers in callback"));
            }

            String razorpayOrderId = request.get("razorpay_order_id").toString();
            String razorpayPaymentId = request.get("razorpay_payment_id").toString();
            String razorpaySignature = request.get("razorpay_signature").toString();

            // orderId is optional - we'll get it from payment record
            if (request.get("orderId") != null) {
                try {
                    orderIdFromRequest = Long.parseLong(request.get("orderId").toString());
                    System.out.println("📋 OrderId from request: " + orderIdFromRequest);
                } catch (Exception e) {
                    System.out.println("⚠️ Invalid orderId in request: " + request.get("orderId")
                            + ", will get from payment record");
                }
            } else {
                System.out.println("⚠️ No orderId in request, will get from payment record");
            }

            // Verify signature
            boolean isValid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (!isValid) {
                System.err.println("Invalid payment signature");
                return ResponseEntity.status(400).body(Map.of("error", "Invalid payment signature"));
            }

            // CRITICAL: Use centralized payment success handler for atomic updates
            // This ensures both Payment and Order are updated together
            Payment existingPayment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            Long orderId = orderIdFromRequest; // Start with orderId from request

            if (existingPayment != null) {
                // Use the centralized onPaymentSuccess method for atomic update
                System.out.println("✅ Found existing payment by razorpayOrderId: " + razorpayOrderId);

                // Get orderId from payment record if not provided in request
                if (orderId == null && existingPayment.getOrders() != null
                        && existingPayment.getOrders().getOrdersId() != null) {
                    orderId = existingPayment.getOrders().getOrdersId();
                    System.out.println("📋 Using orderId from payment record: " + orderId);
                } else if (orderId != null) {
                    System.out.println("📋 Using orderId from request: " + orderId);
                }

                // Call the payment success handler
                try {
                    paymentService.onPaymentSuccess(razorpayOrderId, razorpayPaymentId, razorpaySignature);
                    System.out.println("✅ Payment success handler completed");

                    // CRITICAL: Refresh payment to get the actual orderId after update
                    // The orderId might be different from the request
                    Payment refreshedPayment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (refreshedPayment != null && refreshedPayment.getOrders() != null
                            && refreshedPayment.getOrders().getOrdersId() != null) {
                        orderId = refreshedPayment.getOrders().getOrdersId();
                        System.out.println("📋 Updated orderId from refreshed payment record: " + orderId);
                    }
                } catch (Exception e) {
                    System.err.println("❌ ERROR in payment success handler: " + e.getMessage());
                    e.printStackTrace();
                    // If onPaymentSuccess fails, try manual update using orderId
                    if (orderId != null) {
                        System.out.println("🔄 Attempting manual payment status update for order #" + orderId);
                        try {
                            Orders manualOrder = ordersRepository.findById(orderId).orElse(null);
                            if (manualOrder != null) {
                                manualOrder.setPaymentStatus(PaymentStatus.PAID);
                                ordersRepository.save(manualOrder);
                                System.out.println("✅ Manually updated order #" + orderId + " to PAID");
                            } else {
                                System.err.println("❌ Order #" + orderId + " not found for manual update");
                            }
                        } catch (Exception manualError) {
                            System.err.println("❌ Manual update also failed: " + manualError.getMessage());
                        }
                    }
                    throw e; // Re-throw to be caught by outer try-catch
                }
            } else {
                // Try to find by razorpayPaymentId (fallback for test scenarios)
                existingPayment = paymentService.getPayment(razorpayPaymentId);

                if (existingPayment != null) {
                    // Update existing payment with Razorpay details and status
                    System.out.println("✅ Found existing payment by razorpayPaymentId: " + razorpayPaymentId);
                    paymentService.markPaymentPaidWithRazorpayDetails(razorpayPaymentId, razorpayOrderId,
                            razorpaySignature);

                    // Get orderId from payment record
                    if (existingPayment.getOrders() != null && existingPayment.getOrders().getOrdersId() != null) {
                        orderId = existingPayment.getOrders().getOrdersId();
                    }
                } else {
                    // Payment doesn't exist - create new one
                    System.out.println("⚠️ Payment not found, creating new payment record");
                    // Use orderId from request if provided, otherwise create payment without order
                    Long orderIdToUse = orderIdFromRequest;

                    // Get order to get amount (or use 0.0 if order doesn't exist for testing)
                    Double amount = 0.0;
                    Orders order = null;
                    if (orderIdToUse != null) {
                        try {
                            order = ordersRepository.findById(orderIdToUse).orElse(null);
                            if (order != null) {
                                amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
                                orderId = orderIdToUse;
                            }
                        } catch (Exception e) {
                            // Order might not exist, use default amount
                            System.out.println("Order not found, using default amount: " + e.getMessage());
                        }
                    }

                    // Create payment - with order if exists, without if not (for testing)
                    if (order != null) {
                        paymentService.createPayment(orderIdToUse, amount, razorpayPaymentId);
                        // Now mark as paid and store Razorpay fields
                        paymentService.markPaymentPaidWithRazorpayDetails(razorpayPaymentId, razorpayOrderId,
                                razorpaySignature);
                        System.out.println("✅ Created new payment and marked as PAID for order #" + orderIdToUse);
                        orderId = orderIdToUse;
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
                        paymentService.createPaymentWithoutOrder(amount, razorpayPaymentId, razorpayOrderId,
                                razorpaySignature);
                        System.out.println("✅ Created payment without order (testing mode)");
                        // orderId remains null for payments without orders

                    }
                }

            }

            // CRITICAL: Final verification - ensure order payment status is PAID (only if
            // order exists)
            // Try to get orderId from payment record if not set
            if (orderId == null) {
                Payment finalPaymentCheck = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                if (finalPaymentCheck != null && finalPaymentCheck.getOrders() != null
                        && finalPaymentCheck.getOrders().getOrdersId() != null) {
                    orderId = finalPaymentCheck.getOrders().getOrdersId();
                    System.out.println("📋 Retrieved orderId from payment record for final check: " + orderId);
                } else if (orderIdFromRequest != null) {
                    orderId = orderIdFromRequest;
                    System.out.println("📋 Using orderId from request for final check: " + orderId);
                }
            }

            if (orderId != null) {
                Orders finalCheckOrder = ordersRepository.findById(orderId).orElse(null);
                if (finalCheckOrder == null) {
                    System.err.println("❌ CRITICAL: Order #" + orderId + " not found after payment processing");
                    System.err.println("   Attempted orderId from request: " + orderIdFromRequest);
                    System.err.println("   Razorpay Order ID: " + razorpayOrderId);

                    // Try to find order by checking payment record one more time
                    Payment lastAttemptPayment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (lastAttemptPayment != null && lastAttemptPayment.getOrders() != null) {
                        Long actualOrderId = lastAttemptPayment.getOrders().getOrdersId();
                        System.err.println("   Found orderId in payment record: " + actualOrderId);
                        Orders actualOrder = ordersRepository.findById(actualOrderId).orElse(null);
                        if (actualOrder != null) {
                            System.out.println("✅ Found order using payment record! Order #" + actualOrderId);
                            orderId = actualOrderId;
                            finalCheckOrder = actualOrder;
                        }
                    }

                    if (finalCheckOrder == null) {
                        System.err.println("   Order still not found. Payment may not be linked to an order.");
                        return ResponseEntity.status(500).body(Map.of(
                                "error", "Order not found after payment processing",
                                "orderId", orderId,
                                "orderIdFromRequest", orderIdFromRequest != null ? orderIdFromRequest : "null",
                                "razorpayOrderId", razorpayOrderId,
                                "suggestion",
                                "Check if order exists in database. Payment may have been created without order link."));
                    }
                }

                String finalPaymentStatus = finalCheckOrder.getPaymentStatus().toString();
                boolean isPaid = finalCheckOrder.getPaymentStatus() == PaymentStatus.PAID;

                System.out.println(
                        "📊 Final Payment Status Verification for Order #" + orderId + ": " + finalPaymentStatus);

                if (!isPaid) {
                    System.err.println("❌ CRITICAL: Order payment status is NOT PAID after processing!");
                    System.err.println("Expected: PAID, Actual: " + finalPaymentStatus);
                    // Attempt one more sync
                    try {
                        paymentService.syncPaymentStatusForOrder(orderId);
                        finalCheckOrder = ordersRepository.findById(orderId).orElse(null);
                        finalPaymentStatus = finalCheckOrder != null ? finalCheckOrder.getPaymentStatus().toString()
                                : "UNKNOWN";
                        isPaid = finalCheckOrder != null && finalCheckOrder.getPaymentStatus() == PaymentStatus.PAID;
                        System.out.println("🔄 Retry sync - New status: " + finalPaymentStatus);
                    } catch (Exception e) {
                        System.err.println("❌ Sync retry failed: " + e.getMessage());
                    }
                }

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment verified and saved",
                        "paymentId", razorpayPaymentId,
                        "orderId", orderId,
                        "paymentStatus", finalPaymentStatus,
                        "verified", isPaid));
            } else {
                // Payment created without order (testing scenario)
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment verified and saved (no associated order)",
                        "paymentId", razorpayPaymentId,
                        "note", "Payment created without order link"));
            }
        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(70));
            System.err.println("❌ CALLBACK ERROR");
            System.err.println("=".repeat(70));
            e.printStackTrace();
            System.err.println("Error message: " + e.getMessage());
            System.err.println("=".repeat(70) + "\n");

            // If we have an orderId, try to manually update it as a last resort
            if (orderIdFromRequest != null) {
                try {
                    System.out.println(
                            "🔄 Last resort: Attempting manual payment status update for order #" + orderIdFromRequest);
                    Orders lastResortOrder = ordersRepository.findById(orderIdFromRequest).orElse(null);
                    if (lastResortOrder != null) {
                        lastResortOrder.setPaymentStatus(PaymentStatus.PAID);
                        ordersRepository.save(lastResortOrder);
                        System.out.println(
                                "✅ Last resort update successful - Order #" + orderIdFromRequest + " set to PAID");
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Payment processed with manual fallback",
                                "orderId", orderIdFromRequest,
                                "paymentStatus", "PAID",
                                "warning", "Callback had errors but order was updated manually"));
                    }
                } catch (Exception manualError) {
                    System.err.println("❌ Last resort update also failed: " + manualError.getMessage());
                }
            }

            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to process callback: " + e.getMessage(),
                    "orderId", orderIdFromRequest != null ? orderIdFromRequest : "unknown"));
        }
    }

    // ==========================================
    // Sync Payment Status from Payment table to Orders table
    // Fixes cases where payment is PAID but order shows PENDING
    // Supports both GET and POST for convenience
    // ==========================================
    @GetMapping("/sync-payment-status")
    @PostMapping("/sync-payment-status")
    public ResponseEntity<?> syncPaymentStatus() {
        try {
            System.out.println("\n" + "=".repeat(70));
            System.out.println("🔄 SYNCING ALL PAYMENT STATUSES");
            System.out.println("=".repeat(70));

            int syncedCount = paymentService.syncPaymentStatusFromPayments();

            System.out.println("✅ Sync completed. Total orders fixed: " + syncedCount);
            System.out.println("=".repeat(70) + "\n");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment status synced successfully",
                    "syncedOrders", syncedCount,
                    "timestamp", java.time.LocalDateTime.now().toString()));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Sync failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to sync payment status",
                    "message", e.getMessage(),
                    "timestamp", java.time.LocalDateTime.now().toString()));
        }
    }

    // ==========================================
    // Sync Payment Status for a specific order
    // Supports both GET and POST for convenience
    // ==========================================
    @GetMapping("/sync-payment-status/{orderId}")
    @PostMapping("/sync-payment-status/{orderId}")
    public ResponseEntity<?> syncPaymentStatusForOrder(@PathVariable Long orderId) {
        try {
            System.out.println("\n🔄 Syncing payment status for order #" + orderId);
            boolean synced = paymentService.syncPaymentStatusForOrder(orderId);
            if (synced) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment status synced for order #" + orderId,
                        "orderId", orderId,
                        "timestamp", java.time.LocalDateTime.now().toString()));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "No payment found or payment status already synced for order #" + orderId,
                        "orderId", orderId,
                        "timestamp", java.time.LocalDateTime.now().toString()));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to sync payment status",
                    "message", e.getMessage(),
                    "orderId", orderId,
                    "timestamp", java.time.LocalDateTime.now().toString()));
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

            System.out.println(
                    "✅ Found order with ID: " + orderId + ", current payment status: " + order.getPaymentStatus());

            // Update order payment status to FAILED
            order.setPaymentStatus(com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.FAILED);
            ordersRepository.save(order);
            System.out.println("✅ Updated order payment status to FAILED");

            // Also update payment entity if it exists
            try {
                // Try to find payment by order
                com.smartbiz.sakhistore.modules.payment.model.Payment payment = paymentService
                        .getPaymentByOrderId(orderId);
                if (payment != null) {
                    payment.setStatus(com.smartbiz.sakhistore.modules.payment.model.PaymentStatus.FAILED);
                    paymentService.savePayment(payment);
                    System.out.println("✅ Updated payment entity status to FAILED");
                } else {
                    System.out.println("ℹ️ No payment entity found for order ID: " + orderId
                            + " (this is normal if payment was never created)");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Could not update payment entity: " + e.getMessage());
                e.printStackTrace();
                // Continue even if payment entity update fails - don't throw exception
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment marked as failed",
                    "orderId", orderId));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error marking payment as failed: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to mark payment as failed: " + e.getMessage()));
        }
    }
}
