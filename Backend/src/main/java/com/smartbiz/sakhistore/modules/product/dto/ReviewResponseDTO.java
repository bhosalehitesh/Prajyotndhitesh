package com.smartbiz.sakhistore.modules.product.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReviewResponseDTO {

    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getProductId() {
		return productId;
	}
	public void setProductId(Long productId) {
		this.productId = productId;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public Integer getRating() {
		return rating;
	}
	public void setRating(Integer rating) {
		this.rating = rating;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public ReviewResponseDTO(Long id, Long productId, Long userId, String userName, Integer rating, String comment,
			LocalDateTime createdAt) {
		super();
		this.id = id;
		this.productId = productId;
		this.userId = userId;
		this.userName = userName;
		this.rating = rating;
		this.comment = comment;
		this.createdAt = createdAt;
	}
	public ReviewResponseDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
    
}