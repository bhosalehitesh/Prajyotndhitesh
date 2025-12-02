package com.smartbiz.sakhistore.modules.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;

public interface BusinessDetailsRepo extends JpaRepository<BusinessDetails, Long> {

}
