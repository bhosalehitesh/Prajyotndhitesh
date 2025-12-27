package com.smartbiz.sakhistore.modules.pincode.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.smartbiz.sakhistore.modules.pincode.DTOs.PostOfficeResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LivePincodeLookupService {

    private final RestTemplate restTemplate;

    public PostOfficeResponse.PostOffice getLiveDetails(String pincode) {

        String url = "https://api.postalpincode.in/pincode/" + pincode;

        int MAX_RETRIES = 3;

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

                System.out.println("Attempt " + i + " failed: " + ex.getMessage());

                if (i == MAX_RETRIES) {
                    throw new RuntimeException("India Post API is not responding. Please try again later.");
                }

                try { Thread.sleep(1000); } catch (Exception ignored) {}
            }
        }

        throw new RuntimeException("Unexpected error");
    }

}
