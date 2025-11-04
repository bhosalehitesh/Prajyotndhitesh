package com.sakhi.store.repository;

import com.sakhi.store.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.time.Instant;
import java.util.List;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(String phone);
    List<Otp> findByPhoneAndCreatedAtAfter(String phone, Instant since);
}
