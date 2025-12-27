package com.smartbiz.sakhistore.config;

import org.springframework.beans.factory.annotation.Value;  
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException; 


@Configuration
public class RazorpayConfig {

	@Value("${razorpay.key:}")
	private String razorpayKey;

	@Value("${razorpay.secret:}")
	private String razorpaySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (razorpayKey == null || razorpayKey.isEmpty() || razorpaySecret == null || razorpaySecret.isEmpty()) {
                System.err.println("⚠️ [RazorpayConfig] Razorpay keys not configured. Payment features will not work.");
                return null;
            }
            return new RazorpayClient(razorpayKey, razorpaySecret);
        } catch (RazorpayException e) {
            System.err.println("⚠️ [RazorpayConfig] Failed to initialize Razorpay client: " + e.getMessage());
            System.err.println("⚠️ [RazorpayConfig] Payment features will not work, but application will continue.");
            e.printStackTrace();
            return null; // Return null instead of throwing - let the app start
        }
    }
}

