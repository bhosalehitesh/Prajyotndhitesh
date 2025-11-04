package com.sakhi.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsClient {
    private static final Logger log = LoggerFactory.getLogger(SmsClient.class);

    /**
     * Mock SMS sender (for development).
     * In production we’ll connect to sms.kutility.com API.
     */
    public void sendOtp(String phone, String otp) {
        log.info("✅ [DEV SMS] Sending OTP {} to phone {}", otp, phone);
        // TODO: later integrate kutility API call here
    }
}
