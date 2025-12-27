package com.smartbiz.sakhistore.modules.payment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayService {

    @Value("${razorpay.key:}")
    private String razorpayKeyId;

    @Value("${razorpay.secret:}")
    private String razorpayKeySecret;

    /**
     * Create a Razorpay order
     * @param amount Amount in rupees (will be converted to paise)
     * @param orderId Your internal order ID
     * @return Map containing razorpayOrderId, amount, and razorpayKey
     */
    public Map<String, Object> createOrder(Double amount, Long orderId) throws RazorpayException {
        if (razorpayKeyId == null || razorpayKeyId.isEmpty() || 
            razorpayKeySecret == null || razorpayKeySecret.isEmpty()) {
            throw new RuntimeException("Razorpay credentials not configured. Please add razorpay.key and razorpay.secret in application.properties");
        }

        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_" + orderId);
        orderRequest.put("notes", new JSONObject().put("orderId", orderId.toString()));

        Order order = razorpay.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", order.get("id"));
        response.put("amount", amount);
        response.put("razorpayKey", razorpayKeyId);
        response.put("currency", "INR");

        return response;
    }

    /**
     * Verify Razorpay payment signature
     * @param razorpayOrderId Order ID from Razorpay
     * @param razorpayPaymentId Payment ID from Razorpay
     * @param razorpaySignature Signature from Razorpay
     * @return true if signature is valid
     */
    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String message = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            return generatedSignature.equals(razorpaySignature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}

