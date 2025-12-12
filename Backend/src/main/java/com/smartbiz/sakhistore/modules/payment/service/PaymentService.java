package com.smartbiz.sakhistore.modules.payment.service;


import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.customer_user.model.*;
import com.smartbiz.sakhistore.modules.payment.repository.PaymentRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    // ================================
    // Create Payment Entry
    // ================================
    public Payment createPayment(Long orderId, Double amount, String paymentId) {

        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentId(paymentId);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrders(order);

        return paymentRepository.save(payment);
    }

    // ================================
    // Update Payment Status
    // ================================
    public Payment updatePaymentStatus(String paymentId, PaymentStatus status) {

        Payment payment = paymentRepository.findByPaymentId(paymentId);
        if (payment == null)
            throw new RuntimeException("Payment ID not found");

        payment.setStatus(status);
        paymentRepository.save(payment);

        // Also update order payment status if order exists
        Orders order = payment.getOrders();
        if (order != null) {
            order.setPaymentStatus(status);
            ordersRepository.save(order);
        }

        return payment;
    }

    // ================================
    // Get Payment by ID
    // ================================
    public Payment getPayment(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // ================================
    // Create Payment Entry (without order - for testing)
    // ================================
    public Payment createPaymentWithoutOrder(Double amount, String paymentId) {
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentId(paymentId);
        payment.setStatus(PaymentStatus.PENDING);
        // orders can be null for testing purposes
        return paymentRepository.save(payment);
    }
}
