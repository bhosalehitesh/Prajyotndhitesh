package com.smartbiz.sakhistore.modules.product.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequestDTO {

    @NotNull
    private Long userId;    // For now: pass from frontend / Swagger

    
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
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

	public ReviewRequestDTO(@NotNull Long userId, @NotNull @Min(1) @Max(5) Integer rating, String comment) {
		super();
		this.userId = userId;
		this.rating = rating;
		this.comment = comment;
	}

	public ReviewRequestDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
    
    
    
}