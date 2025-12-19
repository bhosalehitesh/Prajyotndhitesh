package com.smartbiz.sakhistore.modules.order.model;

import java.time.LocalDateTime;
import java.util.List;
import com.smartbiz.sakhistore.modules.payment.model.PaymentStatus;
import com.smartbiz.sakhistore.modules.payment.model.Payment;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Orders {
    @Id
    @GeneratedValue(generator = "orderId")
//	@SequenceGenerator(initialValue = 101001,allocationSize = 1,name = "orderId")
    private Long OrdersId;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @CreationTimestamp
    private LocalDateTime creationTime;

    @Column(nullable = false)
    private Long mobile;

    @Column(nullable = false)
    private String address;

    @ManyToOne
    @JsonIgnore  // Prevent circular reference with User
    private User user;

    // Store and Seller IDs for seller app visibility
    private Long storeId;
    private Long sellerId;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    @JsonManagedReference  // Parent side - serialize this
    private List<OrderItems> orderItems;

    @OneToOne(mappedBy = "orders", cascade = CascadeType.ALL)
    @JsonIgnore  // Prevent circular reference with Payment
    private Payment payment;

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }





    public List<OrderItems> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItems> orderItems) {
        this.orderItems = orderItems;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
    }

    public LocalDateTime getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(LocalDateTime creationTime) {
        this.creationTime = creationTime;
    }

    public Long getMobile() {
        return mobile;
    }

    public void setMobile(Long mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getOrdersId() {
        return OrdersId;
    }

    public void setOrdersId(Long ordersId) {
        OrdersId = ordersId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    // ===============================
    // Customer Info Getters (for JSON serialization)
    // These allow access to user info without serializing the full user object
    // ===============================
    
    /**
     * Get customer name from user object
     * This will be included in JSON response even though user is @JsonIgnore
     */
    public String getCustomerName() {
        return user != null ? user.getFullName() : null;
    }

    /**
     * Get customer phone from user object
     * This will be included in JSON response even though user is @JsonIgnore
     */
    public String getCustomerPhone() {
        return user != null ? user.getPhone() : null;
    }

    /**
     * Get customer ID from user object
     * This will be included in JSON response even though user is @JsonIgnore
     */
    public Long getCustomerId() {
        return user != null ? user.getId() : null;
    }
}
