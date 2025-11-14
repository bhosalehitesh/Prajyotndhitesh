package com.sakhi.store.repository;

import com.sakhi.store.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    /**
     * Find the latest unverified OTP for a phone number
     */
    Optional<Otp> findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);
    
    /**
     * Find OTP by phone and code
     */
    Optional<Otp> findByPhoneAndCode(String phone, String code);
    
    /**
     * Delete expired OTPs (can be used for cleanup)
     */
    void deleteByExpiresAtBefore(java.time.LocalDateTime dateTime);
}

