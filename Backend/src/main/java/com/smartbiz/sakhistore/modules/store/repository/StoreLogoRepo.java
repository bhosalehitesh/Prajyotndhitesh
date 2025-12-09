package com.smartbiz.sakhistore.modules.store.repository;

import com.smartbiz.sakhistore.modules.store.model.StoreLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreLogoRepo extends JpaRepository<StoreLogo, Long> {
    
    // Find active logo for a store
    Optional<StoreLogo> findByStore_StoreIdAndIsActiveTrue(Long storeId);
    
    // Find active logo for a seller
    Optional<StoreLogo> findBySeller_SellerIdAndIsActiveTrue(Long sellerId);
    
    // Find all logos for a store
    List<StoreLogo> findByStore_StoreIdOrderByUploadedAtDesc(Long storeId);
    
    // Find all logos for a store (without ordering)
    List<StoreLogo> findByStore_StoreId(Long storeId);
    
    // Find all logos for a seller
    List<StoreLogo> findBySeller_SellerIdOrderByUploadedAtDesc(Long sellerId);
    
    // Find all active logos
    List<StoreLogo> findByIsActiveTrue();
}

