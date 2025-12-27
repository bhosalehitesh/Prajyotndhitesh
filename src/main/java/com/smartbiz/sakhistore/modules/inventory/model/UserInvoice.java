package com.smartbiz.sakhistore.modules.inventory.model;



import java.time.LocalDateTime; 
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoice")
public class UserInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    private String invoiceNumber;
    private LocalDateTime invoiceDate;

    // ===== SNAPSHOT IDS =====
    private Long orderId;
    private Long userId;
    private Long paymentId;

    // ===== USER INFO =====
    private String userName;
    private String userPhone;
    private String userEmail;

    // ===== ADDRESS =====
    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    // ===== TOTALS =====
    private Double subTotal;
    private Double taxAmount;
    private Double discountAmount;
    private Double deliveryCharges;
    private Double grandTotal;

    // ===== PAYMENT SNAPSHOT =====
    private String paymentMethod;
    private String paymentStatus;
    private Double paymentAmount;

    // ===== PRODUCTS =====
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<InvoiceItem> items;

    public UserInvoice() {}

	public Long getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(Long invoiceId) {
		this.invoiceId = invoiceId;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public LocalDateTime getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(LocalDateTime invoiceDate) {
		this.invoiceDate = invoiceDate;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(Long paymentId) {
		this.paymentId = paymentId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserPhone() {
		return userPhone;
	}

	public void setUserPhone(String userPhone) {
		this.userPhone = userPhone;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

	public String getBillingAddress() {
		return billingAddress;
	}

	public void setBillingAddress(String billingAddress) {
		this.billingAddress = billingAddress;
	}

	public String getShippingAddress() {
		return shippingAddress;
	}

	public void setShippingAddress(String shippingAddress) {
		this.shippingAddress = shippingAddress;
	}

	public Double getSubTotal() {
		return subTotal;
	}

	public void setSubTotal(Double subTotal) {
		this.subTotal = subTotal;
	}

	public Double getTaxAmount() {
		return taxAmount;
	}

	public void setTaxAmount(Double taxAmount) {
		this.taxAmount = taxAmount;
	}

	public Double getDiscountAmount() {
		return discountAmount;
	}

	public void setDiscountAmount(Double discountAmount) {
		this.discountAmount = discountAmount;
	}

	public Double getDeliveryCharges() {
		return deliveryCharges;
	}

	public void setDeliveryCharges(Double deliveryCharges) {
		this.deliveryCharges = deliveryCharges;
	}

	public Double getGrandTotal() {
		return grandTotal;
	}

	public void setGrandTotal(Double grandTotal) {
		this.grandTotal = grandTotal;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public Double getPaymentAmount() {
		return paymentAmount;
	}

	public void setPaymentAmount(Double paymentAmount) {
		this.paymentAmount = paymentAmount;
	}

	public List<InvoiceItem> getItems() {
		return items;
	}

	public void setItems(List<InvoiceItem> items) {
		this.items = items;
	}

	
	
	@Enumerated(EnumType.STRING)
	private InvoiceStatus status = InvoiceStatus.PENDING;

	public UserInvoice(Long invoiceId, String invoiceNumber, LocalDateTime invoiceDate, Long orderId, Long userId,
			Long paymentId, String userName, String userPhone, String userEmail, String billingAddress,
			String shippingAddress, Double subTotal, Double taxAmount, Double discountAmount, Double deliveryCharges,
			Double grandTotal, String paymentMethod, String paymentStatus, Double paymentAmount,
			List<InvoiceItem> items, InvoiceStatus status, String pdfPath) {
		super();
		this.invoiceId = invoiceId;
		this.invoiceNumber = invoiceNumber;
		this.invoiceDate = invoiceDate;
		this.orderId = orderId;
		this.userId = userId;
		this.paymentId = paymentId;
		this.userName = userName;
		this.userPhone = userPhone;
		this.userEmail = userEmail;
		this.billingAddress = billingAddress;
		this.shippingAddress = shippingAddress;
		this.subTotal = subTotal;
		this.taxAmount = taxAmount;
		this.discountAmount = discountAmount;
		this.deliveryCharges = deliveryCharges;
		this.grandTotal = grandTotal;
		this.paymentMethod = paymentMethod;
		this.paymentStatus = paymentStatus;
		this.paymentAmount = paymentAmount;
		this.items = items;
		this.status = status;
		this.pdfPath = pdfPath;
	}

	private String pdfPath; // absolute or relative path to saved PDF

	// getters/setters
	public InvoiceStatus getStatus() { return status; }
	public void setStatus(InvoiceStatus status) { this.status = status; }

	public String getPdfPath() { return pdfPath; }
	public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    // getters & setters
    
    
}
