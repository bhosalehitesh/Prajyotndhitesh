package com.sakhi.store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StoreDetailsRequest {

    @NotBlank(message = "Store name is required")
    private String storeName;

    @NotBlank(message = "Store link is required")
    private String storeLink; // only text part (e.g., "atharv-electronics")
}
