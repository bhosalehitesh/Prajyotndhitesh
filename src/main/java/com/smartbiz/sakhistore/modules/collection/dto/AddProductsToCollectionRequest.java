package com.smartbiz.sakhistore.modules.collection.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * DTO for adding products to a collection
 */
@Data
public class AddProductsToCollectionRequest {

    @NotNull(message = "Collection ID is required")
    private Long collectionId;

    @NotEmpty(message = "At least one product ID is required")
    private List<Long> productIds;

    public AddProductsToCollectionRequest() {
    }

    public AddProductsToCollectionRequest(Long collectionId, List<Long> productIds) {
        this.collectionId = collectionId;
        this.productIds = productIds;
    }

    // Validation helper
    public boolean isValid() {
        return collectionId != null && collectionId > 0
            && productIds != null && !productIds.isEmpty();
    }
}

