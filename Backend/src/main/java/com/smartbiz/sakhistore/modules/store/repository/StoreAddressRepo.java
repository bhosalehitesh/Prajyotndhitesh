package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;

public interface StoreAddressRepo extends JpaRepository<StoreAddress, Long> {

}
