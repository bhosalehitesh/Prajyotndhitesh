package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;

import java.util.List;

public interface StoreAddressRepo extends JpaRepository<StoreAddress, Long> {
    // Filter by seller via store relationship
    List<StoreAddress> findByStoreDetails_Seller_SellerId(Long sellerId);
}
