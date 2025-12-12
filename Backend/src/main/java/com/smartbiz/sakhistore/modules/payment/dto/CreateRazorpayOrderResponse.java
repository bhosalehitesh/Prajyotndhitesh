package com.smartbiz.sakhistore.modules.payment.dto;

import lombok.Data;

@Data
public class CreateRazorpayOrderResponse {
	private String razorpayOrderId;
	private String razorpayKey;
	private Double amount;
	private String currency = "INR";

	public CreateRazorpayOrderResponse(String razorpayOrderId, String razorpayKey, Double amount, String currency) {
		super();
		this.razorpayOrderId = razorpayOrderId;
		this.razorpayKey = razorpayKey;
		this.amount = amount;
		this.currency = currency;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}

	public String getRazorpayKey() {
		return razorpayKey;
	}

	public void setRazorpayKey(String razorpayKey) {
		this.razorpayKey = razorpayKey;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public CreateRazorpayOrderResponse() {
		super();
		// TODO Auto-generated constructor stub
	}

}
