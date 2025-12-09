package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;

import java.util.List;

public interface BusinessDetailsRepo extends JpaRepository<BusinessDetails, Long> {
    // Filter by seller via store relationship
    List<BusinessDetails> findByStoreDetails_Seller_SellerId(Long sellerId);
}
