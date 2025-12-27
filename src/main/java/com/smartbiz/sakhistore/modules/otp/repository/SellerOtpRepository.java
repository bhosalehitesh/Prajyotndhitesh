package com.smartbiz.sakhistore.modules.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.smartbiz.sakhistore.modules.otp.model.Otp;

public interface SellerOtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findTopByPhoneOrderByCreatedAtDesc(String phone);

    Optional<Otp> findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);

    Optional<Otp> findByPhoneAndCode(String phone, String code);

    // NEW: delete only unverified OTP — IMPORTANT FIX
    void deleteByPhoneAndVerifiedFalse(String phone);

    void deleteByExpiresAtBefore(java.time.LocalDateTime dateTime);
    Otp findTopByPhoneOrderByIdDesc(String phone);
}
