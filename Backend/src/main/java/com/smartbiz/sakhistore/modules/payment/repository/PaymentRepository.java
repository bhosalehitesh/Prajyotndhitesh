package com.smartbiz.sakhistore.modules.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.payment.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByPaymentId(String paymentId);
    Payment findByRazorpayOrderId(String razorpayOrderId);
    Payment findByOrders_OrdersId(Long orderId);
}
