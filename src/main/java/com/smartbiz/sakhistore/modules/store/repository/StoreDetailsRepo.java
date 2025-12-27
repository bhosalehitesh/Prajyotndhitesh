package com.smartbiz.sakhistore.modules.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;

public interface StoreDetailsRepo extends JpaRepository<StoreDetails, Long>{

    boolean existsByStoreName(String storeName);

    // All stores owned by a specific seller
    List<StoreDetails> findBySeller_SellerId(Long sellerId);
    
    Optional<StoreDetails> findByStoreName(String storeName);

    Optional<StoreDetails> findByStoreLink(String storeLink);
    
    // Find store by ID with all relationships loaded (JOIN FETCH)
    @Query("SELECT s FROM StoreDetails s " +
           "LEFT JOIN FETCH s.storeAddress " +
           "LEFT JOIN FETCH s.businessDetails " +
           "WHERE s.storeId = :storeId")
    Optional<StoreDetails> findByIdWithRelations(@Param("storeId") Long storeId);
    
    // Find all stores with relationships loaded (JOIN FETCH)
    @Query("SELECT DISTINCT s FROM StoreDetails s " +
           "LEFT JOIN FETCH s.storeAddress " +
           "LEFT JOIN FETCH s.businessDetails")
    List<StoreDetails> findAllWithRelations();
    
}
