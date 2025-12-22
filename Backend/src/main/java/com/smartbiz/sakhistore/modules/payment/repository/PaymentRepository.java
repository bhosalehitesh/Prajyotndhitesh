package com.smartbiz.sakhistore.modules.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.payment.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByPaymentId(String paymentId);
    Payment findByRazorpayOrderId(String razorpayOrderId);
    
    @Query("SELECT p FROM Payment p WHERE p.orders.OrdersId = :orderId")
    Payment findByOrderId(@Param("orderId") Long orderId);
}
