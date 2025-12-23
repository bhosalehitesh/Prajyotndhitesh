package com.smartbiz.sakhistore.modules.payment.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartbiz.sakhistore.modules.order.model.Orders;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "Payment_idAuto")
	private Long paymentAutoId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @CreationTimestamp
    private LocalDateTime createdTime;

    // Internal unique payment id for our record (you already used this)
    @Column(nullable = false, unique = true)
    private String paymentId;

    // Razorpay specific fields
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @OneToOne
    @JoinColumn(name = "orders_orders_id", referencedColumnName = "orders_id")
    @JsonIgnore
    private Orders orders;

	public Long getPaymentAutoId() {
		return paymentAutoId;
	}

	public void setPaymentAutoId(Long paymentAutoId) {
		this.paymentAutoId = paymentAutoId;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
	}

	public PaymentStatus getStatus() {
		return status;
	}

	public void setStatus(PaymentStatus status) {
		this.status = status;
	}

	public LocalDateTime getCreatedTime() {
		return createdTime;
	}

	public void setCreatedTime(LocalDateTime createdTime) {
		this.createdTime = createdTime;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}

	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}

	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}

	public String getRazorpaySignature() {
		return razorpaySignature;
	}

	public void setRazorpaySignature(String razorpaySignature) {
		this.razorpaySignature = razorpaySignature;
	}

	public Orders getOrders() {
		return orders;
	}

	public void setOrders(Orders orders) {
		this.orders = orders;
	}

	public Payment(Long paymentAutoId, Double amount, PaymentStatus status, LocalDateTime createdTime, String paymentId,
			String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, Orders orders) {
		super();
		this.paymentAutoId = paymentAutoId;
		this.amount = amount;
		this.status = status;
		this.createdTime = createdTime;
		this.paymentId = paymentId;
		this.razorpayOrderId = razorpayOrderId;
		this.razorpayPaymentId = razorpayPaymentId;
		this.razorpaySignature = razorpaySignature;
		this.orders = orders;
	}

	public Payment() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
    
}
