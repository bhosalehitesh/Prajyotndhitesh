package com.smartbiz.sakhistore.modules.otp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
        import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsClient {

    private static final Logger logger = LoggerFactory.getLogger(SmsClient.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${sms.dev.mode:true}")
    private boolean devMode;

    @Value("${sms.enabled:true}")
    private boolean smsEnabled;

    @Value("${sms.kutility.api.url:}")
    private String kutilityApiUrl;

    @Value("${sms.kutility.api.key:}")
    private String kutilityApiKey;

    @Value("${sms.kutility.api.secret:}")
    private String kutilityApiSecret;

    @Value("${sms.kutility.sender.id:SAKHI}")
    private String senderId;

    /**
     * Sends OTP via SMS using Kutility API
     * In dev mode, prints OTP to console instead of sending SMS
     *
     * @param phoneNumber Phone number (10 digits)
     * @param otpCode 6-digit OTP code
     * @return true if sent successfully (or in dev mode), false otherwise
     */
    public boolean sendOtp(String phoneNumber, String otpCode) {
        if (!smsEnabled) {
            logger.warn("SMS is disabled. OTP not sent to {}", phoneNumber);
            return false;
        }

        // Development Mode: Print to Console
        if (devMode || kutilityApiKey == null || kutilityApiKey.isEmpty()) {
            printOtpToConsole(phoneNumber, otpCode);
            return true;
        }

        // Production Mode: Send via Kutility
        return sendViaKutility(phoneNumber, otpCode);
    }

    /**
     * Prints OTP to console (Development Mode)
     */
    private void printOtpToConsole(String phoneNumber, String otpCode) {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🔧 [DEV MODE] SMS DISABLED - OTP in Console");
        System.out.println("📱 Phone Number: " + phoneNumber);
        System.out.println("🔢 OTP Code: " + otpCode);
        System.out.println("⏰ Valid for 5 minutes");
        System.out.println("=".repeat(50) + "\n");

        logger.info("[DEV MODE] OTP for {}: {}", phoneNumber, otpCode);
    }

    /**
     * Sends SMS via Kutility API (Production Mode)
     */
    private boolean sendViaKutility(String phoneNumber, String otpCode) {
        try {
            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + kutilityApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to", phoneNumber);
            requestBody.put("message", "Your Sakhi Store OTP is: " + otpCode + ". Valid for 5 minutes.");
            requestBody.put("sender_id", senderId);
            requestBody.put("api_key", kutilityApiKey);
            requestBody.put("api_secret", kutilityApiSecret);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            ResponseEntity<Map> response = restTemplate.exchange(
                    kutilityApiUrl,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("SMS sent successfully to {} via Kutility", phoneNumber);
                return true;
            } else {
                logger.error("Failed to send SMS via Kutility. Status: {}", response.getStatusCode());
                return false;
            }

        } catch (Exception e) {
            logger.error("Error sending SMS via Kutility: {}", e.getMessage());
            // Fallback to console in case of error
            printOtpToConsole(phoneNumber, otpCode);
            return false;
        }
    }

    /**
     * Check if SMS is enabled and configured
     */
    public boolean isSmsConfigured() {
        return smsEnabled && (!devMode && kutilityApiKey != null && !kutilityApiKey.isEmpty());
    }
}