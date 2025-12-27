package com.smartbiz.sakhistore.modules.payment.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderRequest;
import com.smartbiz.sakhistore.modules.payment.dto.CreateRazorpayOrderResponse;
import com.smartbiz.sakhistore.modules.payment.dto.RazorpayCallbackRequest;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.payment.repository.PaymentRepository;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key}")
    private String razorpayKey;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    // =============================================================
    // 1️⃣ CREATE RAZORPAY ORDER (SERVER SIDE)
    // =============================================================
    public String createRazorpayOrder(Double amount) throws RazorpayException {

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", Math.round(amount * 100)); // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("payment_capture", 1);

        // FIX: Correct SDK call
        var order = razorpayClient.orders.create(orderRequest);

        // FIX: Use get("id") instead of getString("id")
        return order.get("id").toString();
    }

    // =============================================================
    // 2️⃣ BUILD RESPONSE + SAVE PAYMENT ENTRY
    // =============================================================
    public CreateRazorpayOrderResponse createRazorpayOrder(CreateRazorpayOrderRequest req)
            throws RazorpayException {

        Long requestedOrderId = java.util.Objects.requireNonNull(req.getOrderId(), "Order id is required");

        Orders order = ordersRepository.findById(requestedOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Double amount = req.getAmount(); // Or calculate from order

        String razorpayOrderId = createRazorpayOrder(amount);

        // Save local payment entry
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentId("PAY-" + System.currentTimeMillis());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrders(order);
        payment.setRazorpayOrderId(razorpayOrderId);

        paymentRepository.save(payment);

        // Prepare response
        CreateRazorpayOrderResponse resp = new CreateRazorpayOrderResponse();
        resp.setRazorpayOrderId(razorpayOrderId);
        resp.setRazorpayKey(razorpayKey);
        resp.setAmount(amount);

        return resp;
    }

    // =============================================================
    // 3️⃣ VERIFY SIGNATURE
    // =============================================================
    public boolean verifySignature(String orderId, String paymentId, String signature) {

        String payload = orderId + "|" + paymentId;

        try {
            Utils.verifySignature(payload, signature, razorpaySecret);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // =============================================================
    // 4️⃣ UPDATE LOCAL PAYMENT RECORD ON SUCCESS
    // CRITICAL: This method MUST mark both Payment and Order as PAID
    // =============================================================
    @Transactional
    public Payment onPaymentSuccess(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("💰 PROCESSING PAYMENT SUCCESS");
        System.out.println("=".repeat(70));
        System.out.println("Razorpay Order ID: " + razorpayOrderId);
        System.out.println("Razorpay Payment ID: " + razorpayPaymentId);

        // Step 1: Find payment by Razorpay Order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
        if (payment == null) {
            throw new RuntimeException("Payment record not found for Razorpay Order ID: " + razorpayOrderId);
        }

        Long orderIdTemp = null;
        if (payment.getOrders() != null && payment.getOrders().getOrdersId() != null) {
            orderIdTemp = payment.getOrders().getOrdersId();
        }

        if (orderIdTemp == null) {
            throw new RuntimeException("Payment #" + payment.getPaymentAutoId() + " has no associated order");
        }

        final Long orderId = orderIdTemp;

        System.out.println("Found Payment ID: " + payment.getPaymentAutoId());
        System.out.println("Associated Order ID: " + orderId);

        // Step 2: Update Payment entity to PAID
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(PaymentStatus.PAID);
        Payment savedPayment = paymentRepository.save(payment);
        System.out.println("✅ Payment status updated to PAID");

        // Step 3: CRITICAL - Update Order payment status to PAID
        // Always fetch fresh order from database to avoid stale data
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order #" + orderId + " not found in database"));

        // Verify current state
        System.out.println("Order #" + orderId + " current payment status: " + order.getPaymentStatus());

        // Update order payment status to PAID
        order.setPaymentStatus(PaymentStatus.PAID);
        Orders savedOrder = ordersRepository.save(order);

        // Step 4: Verify the update was successful
        Orders verificationOrder = ordersRepository.findById(orderId).orElse(null);
        if (verificationOrder != null && verificationOrder.getPaymentStatus() == PaymentStatus.PAID) {
            System.out.println("✅ Order #" + orderId + " payment status verified as PAID in database");
            System.out.println("=".repeat(70) + "\n");
        } else {
            System.err.println("❌ CRITICAL ERROR: Order payment status update failed!");
            System.err.println("Expected: PAID, Actual: "
                    + (verificationOrder != null ? verificationOrder.getPaymentStatus() : "NULL"));
            System.err.println("=".repeat(70) + "\n");
            throw new RuntimeException("Failed to update order payment status to PAID");
        }

        return savedPayment;
    }

    // =============================================================
    // Create Payment Entry
    // =============================================================
    public Payment createPayment(Long orderId, Double amount, String paymentId) {
        if (orderId == null) {
            throw new RuntimeException("orderId is required to create payment");
        }
        if (paymentId == null) {
            throw new RuntimeException("paymentId is required to create payment");
        }
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentId(paymentId);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrders(order);

        return paymentRepository.save(payment);
    }

    // =============================================================
    // Update Payment Status
    // CRITICAL: Atomic update of both Payment and Order
    // =============================================================
    @Transactional
    public void updatePaymentStatus(String paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findByPaymentId(paymentId);
        if (payment == null) {
            throw new RuntimeException("Payment not found with id: " + paymentId);
        }
        payment.setStatus(status);
        paymentRepository.save(payment);

        // Also update order payment status if order exists - ALWAYS fetch fresh order
        Orders order = payment.getOrders();
        if (order != null && order.getOrdersId() != null) {
            // Fetch fresh order from database to ensure we have the latest state
            Orders freshOrder = ordersRepository.findById(order.getOrdersId()).orElse(null);
            if (freshOrder != null) {
                freshOrder.setPaymentStatus(status);
                ordersRepository.save(freshOrder);
                System.out.println("✅ [updatePaymentStatus] Updated order #" + freshOrder.getOrdersId()
                        + " payment status to " + status);
            } else {
                System.err
                        .println("❌ ERROR: Could not find order #" + order.getOrdersId() + " to update payment status");
            }
        }
    }

    // =============================================================
    // Get Payment by Payment ID
    // =============================================================
    public Payment getPayment(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }

    // =============================================================
    // Get Payment by Order ID
    // =============================================================
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrders_OrdersId(orderId);
    }

    // =============================================================
    // Save Payment
    // =============================================================
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    // =============================================================
    // 5️⃣ FINAL CALLBACK HANDLER (VERIFY + UPDATE)
    // =============================================================
    public Payment verifyAndUpdatePayment(RazorpayCallbackRequest callback) {

        boolean valid = verifySignature(
                callback.getRazorpay_order_id(),
                callback.getRazorpay_payment_id(),
                callback.getRazorpay_signature());

        if (!valid) {
            throw new RuntimeException("Razorpay signature verification failed");
        }

        return onPaymentSuccess(
                callback.getRazorpay_order_id(),
                callback.getRazorpay_payment_id(),
                callback.getRazorpay_signature());
    }

    // =============================================================
    // 6️⃣ CAPTURE PAYMENT (IF payment_capture = 0)
    // =============================================================
    public String capturePayment(String razorpayPaymentId, Double amount) throws RazorpayException {

        JSONObject request = new JSONObject();
        request.put("amount", Math.round(amount * 100));

        // FIX: Correct SDK usage
        var response = razorpayClient.payments.capture(razorpayPaymentId, request);

        return response.toString();
    }

    // =============================================================
    // 7️⃣ REFUND PAYMENT
    // =============================================================
    public String refundPayment(String razorpayPaymentId, Double amount) throws RazorpayException {

        JSONObject request = new JSONObject();
        if (amount != null) {
            request.put("amount", Math.round(amount * 100));
        }

        var response = razorpayClient.payments.refund(razorpayPaymentId, request);

        return response.toString();
    }

    // =============================================================
    // 8️⃣ FETCH PAYMENT DETAILS
    // =============================================================
    public String fetchPayment(String razorpayPaymentId) throws RazorpayException {

        var response = razorpayClient.payments.fetch(razorpayPaymentId);

        return response.toString();
    }

    // =============================================================
    // 9️⃣ Mark payment PAID and store Razorpay details
    // CRITICAL: This method MUST mark both Payment and Order as PAID
    // =============================================================
    @Transactional
    public Payment markPaymentPaidWithRazorpayDetails(String razorpayPaymentId, String razorpayOrderId,
            String razorpaySignature) {
        if (razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
            throw new RuntimeException("Missing Razorpay identifiers while marking payment paid");
        }

        System.out.println("\n" + "=".repeat(70));
        System.out.println("💰 MARKING PAYMENT AS PAID");
        System.out.println("=".repeat(70));
        System.out.println("Razorpay Payment ID: " + razorpayPaymentId);
        System.out.println("Razorpay Order ID: " + razorpayOrderId);

        Payment payment = paymentRepository.findByPaymentId(razorpayPaymentId);
        if (payment == null) {
            throw new RuntimeException("Payment not found with id: " + razorpayPaymentId);
        }

        Long orderIdTemp = null;
        if (payment.getOrders() != null && payment.getOrders().getOrdersId() != null) {
            orderIdTemp = payment.getOrders().getOrdersId();
        }

        if (orderIdTemp == null) {
            throw new RuntimeException("Payment #" + payment.getPaymentAutoId() + " has no associated order");
        }

        // Make final for lambda usage
        final Long orderId = orderIdTemp;

        System.out.println("Found Payment ID: " + payment.getPaymentAutoId());
        System.out.println("Associated Order ID: " + orderId);

        // Step 1: Update Payment entity to PAID
        System.out.println("💳 [PaymentService] Marking payment as PAID: " + razorpayPaymentId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(PaymentStatus.PAID);
        Payment savedPayment = paymentRepository.save(payment);
        System.out.println("✅ Payment status updated to PAID");

        // Step 2: CRITICAL - Update Order payment status to PAID
        // Always fetch fresh order from database to avoid stale data
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order #" + orderId + " not found in database"));

        System.out.println("Order #" + orderId + " current payment status: " + order.getPaymentStatus());

        // Update order payment status to PAID
        order.setPaymentStatus(PaymentStatus.PAID);
        Orders savedOrder = ordersRepository.save(order);

        // Step 3: Verify the update was successful
        Orders verificationOrder = ordersRepository.findById(orderId).orElse(null);
        if (verificationOrder != null && verificationOrder.getPaymentStatus() == PaymentStatus.PAID) {
            System.out.println("✅ Order #" + orderId + " payment status verified as PAID in database");
            System.out.println("=".repeat(70) + "\n");
        } else {
            System.err.println("❌ CRITICAL ERROR: Order payment status update failed!");
            System.err.println("Expected: PAID, Actual: "
                    + (verificationOrder != null ? verificationOrder.getPaymentStatus() : "NULL"));
            System.err.println("=".repeat(70) + "\n");
            throw new RuntimeException("Failed to update order payment status to PAID");
        }

        return savedPayment;
    }

    // ================================
    // Create Payment Entry (without order - for testing)
    // ================================
    public Payment createPaymentWithoutOrder(Double amount, String razorpayPaymentId, String razorpayOrderId,
            String razorpaySignature) {
        if (razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
            throw new RuntimeException("Missing Razorpay identifiers for payment creation");
        }
        Payment payment = new Payment();
        payment.setAmount(amount);
        // Use Razorpay payment id as our internal paymentId for test flows
        payment.setPaymentId(razorpayPaymentId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(PaymentStatus.PAID);
        // orders can be null for testing purposes
        return paymentRepository.save(payment);
    }

    // ================================
    // Sync Payment Status from Payment to Orders
    // Fixes cases where payment is PAID but order shows PENDING
    // ================================
    public int syncPaymentStatusFromPayments() {
        int syncedCount = 0;
        List<Payment> allPayments = paymentRepository.findAll();

        for (Payment payment : allPayments) {
            if (payment.getOrders() != null && payment.getStatus() == PaymentStatus.PAID) {
                Orders order = payment.getOrders();
                if (order.getPaymentStatus() != PaymentStatus.PAID) {
                    order.setPaymentStatus(PaymentStatus.PAID);
                    ordersRepository.save(order);
                    syncedCount++;
                    System.out.println("✅ Synced payment status for order #" + order.getOrdersId() +
                            " from " + order.getPaymentStatus() + " to PAID");
                }
            }
        }

        return syncedCount;
    }

    // ================================
    // Sync Payment Status for a specific order
    // ================================
    public boolean syncPaymentStatusForOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // Find payment for this order using repository method
        Payment payment = paymentRepository.findByOrderId(orderId);

        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            if (order.getPaymentStatus() != PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.PAID);
                ordersRepository.save(order);
                System.out.println("✅ Synced payment status for order #" + orderId + " to PAID");
                return true;
            }
        }

        return false;
    }
}
