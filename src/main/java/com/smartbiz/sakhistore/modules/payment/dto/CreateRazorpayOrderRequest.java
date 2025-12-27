package com.smartbiz.sakhistore.modules.payment.dto;

import lombok.Data;

@Data
public class CreateRazorpayOrderRequest {
  
	
	private Long orderId;
	
	private Double amount;
	
	
    public Long getOrderId() {
		return orderId;
	}
	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public CreateRazorpayOrderRequest(Long orderId, Double amount) {
		super();
		this.orderId = orderId;
		this.amount = amount;
	}
	public CreateRazorpayOrderRequest() {
		super();
	}
	
	
	
    
    
    
    
}
