package com.smartbiz.sakhistore.config;

import org.springframework.beans.factory.annotation.Value;  
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException; 


@Configuration
public class RazorpayConfig {

	@Value("${razorpay.key}")
	private String razorpayKey;

	@Value("${razorpay.secret}")
	private String razorpaySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(razorpayKey, razorpaySecret);
    }
}

