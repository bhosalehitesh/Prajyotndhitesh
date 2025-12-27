package com.smartbiz.sakhistore.modules.seller.service;

import java.util.List;

import java.util.NoSuchElementException;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class SellerDetailsService1 {



    @Autowired

    private SellerDetailsRepo sellerDetailsRepository;



    // ✅ Get all sellers

    public List<SellerDetails> allSellers() {

        return sellerDetailsRepository.findAll();

    }



    // ✅ Add or update seller
    public SellerDetails addSeller(SellerDetails seller) {
        if (seller == null) {
            throw new IllegalArgumentException("Seller cannot be null");
        }
        
        if (seller.getSellerId() == null) {
            // New seller - save directly
            if (seller.getCreatedAt() == null) {
                seller.setCreatedAt(java.time.LocalDateTime.now());
            }
            if (seller.getUpdatedAt() == null) {
                seller.setUpdatedAt(java.time.LocalDateTime.now());
            }
            return sellerDetailsRepository.save(seller);
        }
        
        // Existing seller - fetch from database first to get managed entity
        // This avoids detached entity issues with relationships
        SellerDetails existingSeller = sellerDetailsRepository.findById(seller.getSellerId())
                .orElseThrow(() -> new NoSuchElementException("Seller not found with ID: " + seller.getSellerId()));
        
        // Update only the fields that are provided (avoid detached entity issues)
        // Do NOT update relationships (storeDetails, products) as they may be detached
        if (seller.getFullName() != null && !seller.getFullName().trim().isEmpty()) {
            existingSeller.setFullName(seller.getFullName().trim());
        }
        if (seller.getPhone() != null && !seller.getPhone().trim().isEmpty()) {
            existingSeller.setPhone(seller.getPhone().trim());
        }
        if (seller.getEmail() != null) {
            // Allow clearing email by sending empty string
            existingSeller.setEmail(seller.getEmail().trim().isEmpty() ? null : seller.getEmail().trim());
        }
        if (seller.getPassword() != null && !seller.getPassword().isEmpty()) {
            // Only update password if provided (don't overwrite with null/empty)
            existingSeller.setPassword(seller.getPassword());
        }
        if (seller.getStoreCategory() != null) {
            existingSeller.setStoreCategory(seller.getStoreCategory().trim());
        }
        if (seller.getUpdatedAt() != null) {
            existingSeller.setUpdatedAt(seller.getUpdatedAt());
        } else {
            existingSeller.setUpdatedAt(java.time.LocalDateTime.now());
        }
        
        // Save the managed entity (relationships remain unchanged, avoiding detached entity issues)
        return sellerDetailsRepository.save(existingSeller);
    }



    // ✅ Find seller by ID

    public SellerDetails findByIdSD(Long sellerId) {

        return sellerDetailsRepository.findById(sellerId)

                .orElseThrow(() -> new NoSuchElementException("Seller not found with ID: " + sellerId));

    }



    // ✅ Delete seller

    public void deleteSeller(Long sellerId) {

        SellerDetails seller = findByIdSD(sellerId);

        sellerDetailsRepository.delete(seller);

    }

}