package com.sakhi.store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreDetailsResponse {
    private String storeName;
    private String fullStoreUrl;
    private String ownerName;
    private String phone;
}
