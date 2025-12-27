package com.smartbiz.sakhistore.modules.auth.sellerauth.repository;

import java.util.Optional;

import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerDetailsRepo extends JpaRepository<SellerDetails, Long> {
    /**
     * Find user by phone number
     */
    Optional<SellerDetails> findByPhone(String phone);

    /**
     * Check if user exists by phone number
     */
    boolean existsByPhone(String phone);
}
