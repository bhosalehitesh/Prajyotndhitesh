package com.sakhi.store.service;

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
    private static final Logger log = LoggerFactory.getLogger(SmsClient.class);
    
    private final RestTemplate restTemplate;
    
    @Value("${sms.kutility.api.url:}")
    private String apiUrl;
    
    @Value("${sms.kutility.api.key:}")
    private String apiKey;
    
    @Value("${sms.kutility.api.secret:}")
    private String apiSecret;
    
    @Value("${sms.kutility.sender.id:SAKHI}")
    private String senderId;
    
    @Value("${sms.enabled:true}")
    private boolean smsEnabled;
    
    @Value("${sms.dev.mode:true}")
    private boolean devMode;
    
    public SmsClient() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Send OTP SMS via Kutility API
     * In dev mode: Only logs OTP (no real SMS sent)
     * In production mode: Sends real SMS via Kutility
     */
    public void sendOtp(String phone, String otp) {
        // Development mode - just log, don't send real SMS
        if (devMode) {
            log.info("========================================");
            log.info("🔧 [DEV MODE] SMS DISABLED");
            log.info("📱 Phone: {}", phone);
            log.info("🔢 OTP Code: {}", otp);
            log.info("⏰ Valid for 5 minutes");
            log.info("========================================");
            return;
        }
        
        // Check if SMS is enabled
        if (!smsEnabled) {
            log.warn("⚠️ SMS is disabled in configuration");
            return;
        }
        
        // Validate Kutility configuration
        if (apiUrl == null || apiUrl.isEmpty() || 
            apiKey == null || apiKey.isEmpty() || 
            apiSecret == null || apiSecret.isEmpty()) {
            log.error("❌ Kutility SMS configuration incomplete!");
            log.error("   Please check application.properties");
            log.error("   Setting dev.mode=true automatically");
            devMode = true; // Auto-enable dev mode if config missing
            log.info("🔢 OTP Code for {}: {}", phone, otp);
            return;
        }
        
        try {
            String formattedPhone = formatPhoneNumber(phone);
            String message = String.format("Your SmartBiz verification code is: %s. Valid for 5 minutes.", otp);
            
            // Send SMS via Kutility API
            sendSmsToKutility(formattedPhone, message);
            
            log.info("✅ SMS sent successfully to {} via Kutility", phone);
            
        } catch (Exception e) {
            log.error("❌ Failed to send SMS to {} via Kutility: {}", phone, e.getMessage());
            log.error("   Error details: ", e);
            // Don't throw exception - OTP is already saved, user can request again
            // In case of failure, log OTP so user can still test
            log.info("🔢 OTP Code for {}: {}", phone, otp);
        }
    }
    
    /**
     * Send SMS using Kutility API (JSON POST format)
     */
    private void sendSmsToKutility(String phone, String message) {
        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("api_key", apiKey);
            requestBody.put("api_secret", apiSecret);
            requestBody.put("to", phone);
            requestBody.put("message", message);
            requestBody.put("from", senderId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("Kutility API response: {}", response.getBody());
            } else {
                log.warn("Kutility API returned status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Exception calling Kutility API: {}", e.getMessage());
            throw new RuntimeException("Failed to send SMS via Kutility", e);
        }
    }
    
    /**
     * Format phone number for Kutility API: 91XXXXXXXXXX
     */
    private String formatPhoneNumber(String phone) {
        phone = phone.replaceAll("[\\s\\-\\(\\)]", "");
        if (phone.startsWith("+")) {
            phone = phone.substring(1);
        }
        if (phone.length() == 10) {
            return "91" + phone;
        }
        if (phone.length() == 12 && phone.startsWith("91")) {
            return phone;
        }
        return phone;
    }
}
