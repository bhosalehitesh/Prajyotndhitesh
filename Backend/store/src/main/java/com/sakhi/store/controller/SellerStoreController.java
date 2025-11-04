package com.sakhi.store.controller;

import com.sakhi.store.dto.StoreDetailsRequest;
import com.sakhi.store.dto.StoreDetailsResponse;
import com.sakhi.store.service.SellerStoreService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/seller/onboarding/store-details")
public class SellerStoreController {

    private final SellerStoreService sellerStoreService;

    public SellerStoreController(SellerStoreService sellerStoreService) {
        this.sellerStoreService = sellerStoreService;
    }

    // POST: Create or update store details
    @PostMapping
    public ResponseEntity<StoreDetailsResponse> createOrUpdateStore(@Valid @RequestBody StoreDetailsRequest request) {
        String phone = getLoggedInPhone();
        StoreDetailsResponse response = sellerStoreService.createOrUpdateStore(phone, request);
        return ResponseEntity.ok(response);
    }

    // GET: Fetch store details for logged-in seller
    @GetMapping
    public ResponseEntity<StoreDetailsResponse> getStoreDetails() {
        String phone = getLoggedInPhone();
        StoreDetailsResponse response = sellerStoreService.getStore(phone);
        return ResponseEntity.ok(response);
    }

    private String getLoggedInPhone() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // phone stored in JWT subject
    }
}
