package com.sakhi.store.service;

import com.sakhi.store.model.Otp;
import com.sakhi.store.repository.OtpRepository;
import com.sakhi.store.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.Duration;
import java.util.Optional;
import java.util.List;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    // config values, can be moved to application.yml and @Value-injected
    private final int otpLength = 6;
    private final Duration otpTtl = Duration.ofMinutes(5);
    private final Duration resendCooldown = Duration.ofSeconds(60);
    private final int maxAttempts = 5;
    private final int maxResendsPerHour = 5;

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public String generateNumericOtp(int length) {
        SecureRandom rnd = new SecureRandom();
        int max = (int)Math.pow(10, length);
        int min = max / 10; // ensure length digits
        int val = rnd.nextInt(max - min) + min;
        return String.format("%0" + length + "d", val);
    }

    /**
     * Create and persist a new OTP for phone. Returns the created Otp entity.
     * Note: in production do NOT return the OTP to clients. For dev you can read it from DB.
     */
    @Transactional
    public Otp createOtpForPhone(String phone) {
        // check resend cooldown: if last OTP is too recent, throw
        Optional<Otp> last = otpRepository.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone);
        Instant now = Instant.now();
        if (last.isPresent()) {
            Instant lastCreated = last.get().getCreatedAt();
            if (lastCreated.plus(resendCooldown).isAfter(now)) {
                throw new BadRequestException("Please wait before requesting a new code.");
            }
        }

        // check max resends per hour
        Instant oneHourAgo = now.minus(Duration.ofHours(1));
        List<Otp> recent = otpRepository.findByPhoneAndCreatedAtAfter(phone, oneHourAgo);
        if (recent.size() >= maxResendsPerHour) {
            throw new BadRequestException("Too many OTP requests. Try again later.");
        }

        String code = generateNumericOtp(otpLength);
        Instant expiresAt = now.plus(otpTtl);
        Otp otp = new Otp(phone, code, expiresAt);
        Otp saved = otpRepository.save(otp);

        // TODO: trigger SMS sending asynchronously via SmsClient (we'll add next).
        // For now, return Otp; in dev you can inspect saved.getCode()
        return saved;
    }

    /**
     * Verify a code for a phone. Returns the Otp used if success.
     * This method does not activate the user — caller should do that in a transaction.
     */
    @Transactional
    public Otp verifyOtp(String phone, String code) {
        Otp otp = otpRepository.findFirstByPhoneAndUsedFalseOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new BadRequestException("No OTP requested for this number."));

        Instant now = Instant.now();
        if (otp.getExpiresAt() != null && otp.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("OTP expired. Request a new code.");
        }

        if (otp.getAttempts() >= maxAttempts) {
            throw new BadRequestException("Maximum attempts exceeded. Request a new code.");
        }

        if (!otp.getCode().equals(code)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new BadRequestException("Invalid OTP.");
        }

        // success
        otp.setUsed(true);
        otpRepository.save(otp);
        return otp;
    }
}
