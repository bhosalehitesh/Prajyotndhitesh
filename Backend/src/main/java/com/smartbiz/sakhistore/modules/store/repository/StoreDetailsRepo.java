package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;

public interface StoreDetailsRepo extends JpaRepository<StoreDetails, Long>{
    boolean existsByStoreName(String storeName);
}
