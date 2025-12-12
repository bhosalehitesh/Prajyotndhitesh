package com.smartbiz.sakhistore.modules.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;

public interface StoreDetailsRepo extends JpaRepository<StoreDetails, Long>{

    boolean existsByStoreName(String storeName);

    // All stores owned by a specific seller
    List<StoreDetails> findBySeller_SellerId(Long sellerId);
    
    Optional<StoreDetails> findByStoreName(String storeName);

    Optional<StoreDetails> findByStoreLink(String storeLink);
    
}
