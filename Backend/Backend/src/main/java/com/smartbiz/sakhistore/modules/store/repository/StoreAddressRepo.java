package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;

import java.util.List;
import java.util.Optional;

public interface StoreAddressRepo extends JpaRepository<StoreAddress, Long> {
    // Filter by seller via store relationship
    List<StoreAddress> findByStoreDetails_Seller_SellerId(Long sellerId);
    
    // Find address by store_id (for one-to-one relationship)
    Optional<StoreAddress> findByStoreDetails_StoreId(Long storeId);
}
