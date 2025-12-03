package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.common.exceptions.ResourceNotFoundException;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.service.StoreDetailsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreDetailsController {

    @Autowired
    StoreDetailsService storeService;

    @GetMapping("/allStores")
    public List<StoreDetails> allStores() {
        return storeService.allStores();
    }

    @PostMapping("/addStore")
    public StoreDetails addStore(@RequestBody StoreDetails store) {
        return storeService.addStore(store);
    }

    @PostMapping("/editStore")
    public StoreDetails editStore(@RequestBody StoreDetails store) {
        return storeService.addStore(store);
    }

    @GetMapping("/{storeId}")
    public StoreDetails getStore(@PathVariable Long storeId) throws ResourceNotFoundException {
        return storeService.findByIdDS(storeId);
    }

    // Get store for a specific seller (assumes one store per seller)
    // Use a fixed path segment to avoid conflict with "/{storeId}"
    @GetMapping("/seller")
    public StoreDetails getStoreBySeller(@RequestParam("sellerId") Long sellerId) {
        return storeService.findBySellerId(sellerId);
    }

    @DeleteMapping("/deleteStore/{id}")
    public ResponseEntity<String> deleteStore(@PathVariable Long id) throws ResourceNotFoundException {
        storeService.deleteStore(id);
        return ResponseEntity.ok("✅ Store with ID " + id + " deleted successfully.");
    }
}