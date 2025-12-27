package com.smartbiz.sakhistore.modules.inventory.model;



import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_item")
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    @JsonIgnore
    private UserInvoice invoice;

    // ===== SNAPSHOT IDS =====
    private Long productId;
    private Long orderItemId;

    // ===== PRODUCT SNAPSHOT =====
    private String productName;
    private String size;
    private Integer quantity;

    private Double price;
    private Double gstPercent;
    private Double gstAmount;
    private Double total;

    public InvoiceItem() {}

	public Long getItemId() {
		return itemId;
	}

	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}

	public UserInvoice getInvoice() {
		return invoice;
	}

	public void setInvoice(UserInvoice invoice) {
		this.invoice = invoice;
	}

	public Long getProductId() {
		return productId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public Long getOrderItemId() {
		return orderItemId;
	}

	public void setOrderItemId(Long orderItemId) {
		this.orderItemId = orderItemId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public Double getGstPercent() {
		return gstPercent;
	}

	public void setGstPercent(Double gstPercent) {
		this.gstPercent = gstPercent;
	}

	public Double getGstAmount() {
		return gstAmount;
	}

	public void setGstAmount(Double gstAmount) {
		this.gstAmount = gstAmount;
	}

	public Double getTotal() {
		return total;
	}

	public void setTotal(Double total) {
		this.total = total;
	}

	public InvoiceItem(Long itemId, UserInvoice invoice, Long productId, Long orderItemId, String productName,
			String size, Integer quantity, Double price, Double gstPercent, Double gstAmount, Double total) {
		super();
		this.itemId = itemId;
		this.invoice = invoice;
		this.productId = productId;
		this.orderItemId = orderItemId;
		this.productName = productName;
		this.size = size;
		this.quantity = quantity;
		this.price = price;
		this.gstPercent = gstPercent;
		this.gstAmount = gstAmount;
		this.total = total;
	}

    // getters & setters
    
    
}
