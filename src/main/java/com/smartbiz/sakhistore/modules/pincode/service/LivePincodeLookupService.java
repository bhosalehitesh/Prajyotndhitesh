package com.smartbiz.sakhistore.modules.pincode.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.smartbiz.sakhistore.modules.pincode.DTOs.PostOfficeResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LivePincodeLookupService {

    private static final Logger logger = LoggerFactory.getLogger(LivePincodeLookupService.class);
    private static final int MAX_RETRIES = 3;
    private static final int RETRY_DELAY_MS = 1000;

    private final RestTemplate restTemplate;

    public PostOfficeResponse.PostOffice getLiveDetails(String pincode) {
        String url = "https://api.postalpincode.in/pincode/" + pincode;

        for (int i = 1; i <= MAX_RETRIES; i++) {
            try {
                PostOfficeResponse[] response =
                        restTemplate.getForObject(url, PostOfficeResponse[].class);

                if (response == null || response.length == 0) {
                    throw new RuntimeException("Invalid API response");
                }

                PostOfficeResponse res = response[0];

                if (!"Success".equalsIgnoreCase(res.getStatus())) {
                    throw new RuntimeException("Pincode not found");
                }

                if (res.getPostOffice() == null || res.getPostOffice().isEmpty()) {
                    throw new RuntimeException("No PostOffice details found");
                }

                return res.getPostOffice().get(0);

            } catch (Exception ex) {
                logger.warn("Pincode lookup attempt {} failed for pincode {}: {}", i, pincode, ex.getMessage());

                if (i == MAX_RETRIES) {
                    logger.error("All {} attempts failed for pincode lookup: {}", MAX_RETRIES, pincode);
                    throw new RuntimeException("India Post API is not responding. Please try again later.", ex);
                }

                try {
                    Thread.sleep(RETRY_DELAY_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Thread interrupted during retry", e);
                }
            }
        }

        throw new RuntimeException("Unexpected error in pincode lookup");
    }
}
