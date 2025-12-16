package com.smartbiz.sakhistore.modules.payment.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
    // =============================================================
    public Payment onPaymentSuccess(String orderId, String paymentId, String signature) {

        Payment payment = paymentRepository.findByRazorpayOrderId(orderId);

        if (payment == null) {
            throw new RuntimeException("Payment record not found for Razorpay Order ID: " + orderId);
        }

        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(PaymentStatus.PAID);

        paymentRepository.save(payment);

        // Update Order entity also
        Orders order = payment.getOrders();
        if (order != null) {
            order.setPaymentStatus(PaymentStatus.PAID);
            ordersRepository.save(order);
        }

        return payment;
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
    // =============================================================
    public void updatePaymentStatus(String paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findByPaymentId(paymentId);
        if (payment == null) {
            throw new RuntimeException("Payment not found with id: " + paymentId);
        }
        payment.setStatus(status);
        paymentRepository.save(payment);
        
        // Also update order payment status if order exists
        Orders order = payment.getOrders();
        if (order != null) {
            order.setPaymentStatus(status);
            ordersRepository.save(order);
        }
    }

    // =============================================================
    // Get Payment by Payment ID
    // =============================================================
    public Payment getPayment(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }

    // =============================================================
    // 5️⃣ FINAL CALLBACK HANDLER (VERIFY + UPDATE)
    // =============================================================
    public Payment verifyAndUpdatePayment(RazorpayCallbackRequest callback) {

        boolean valid = verifySignature(
                callback.getRazorpay_order_id(),
                callback.getRazorpay_payment_id(),
                callback.getRazorpay_signature()
        );

        if (!valid) {
            throw new RuntimeException("Razorpay signature verification failed");
        }

        return onPaymentSuccess(
                callback.getRazorpay_order_id(),
                callback.getRazorpay_payment_id(),
                callback.getRazorpay_signature()
        );
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
    // =============================================================
    public Payment markPaymentPaidWithRazorpayDetails(String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
        if (razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
            throw new RuntimeException("Missing Razorpay identifiers while marking payment paid");
        }
        Payment payment = paymentRepository.findByPaymentId(razorpayPaymentId);
        if (payment == null) {
            throw new RuntimeException("Payment not found with id: " + razorpayPaymentId);
        }

        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(PaymentStatus.PAID);

        paymentRepository.save(payment);

        Orders order = payment.getOrders();
        if (order != null) {
            order.setPaymentStatus(PaymentStatus.PAID);
            ordersRepository.save(order);
        }

        return payment;
    }

    // ================================
    // Create Payment Entry (without order - for testing)
    // ================================
    public Payment createPaymentWithoutOrder(Double amount, String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
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
}
