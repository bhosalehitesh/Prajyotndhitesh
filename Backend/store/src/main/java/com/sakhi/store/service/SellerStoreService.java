package com.sakhi.store.service;

import com.sakhi.store.dto.StoreDetailsRequest;
import com.sakhi.store.dto.StoreDetailsResponse;
import com.sakhi.store.exception.BadRequestException;
import com.sakhi.store.model.SellerStore;
import com.sakhi.store.model.User;
import com.sakhi.store.repository.SellerStoreRepository;
import com.sakhi.store.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SellerStoreService {

    private final SellerStoreRepository sellerStoreRepository;
    private final UserRepository userRepository;

    private static final String BASE_URL = "https://www.smartbiz.in/";

    public SellerStoreService(SellerStoreRepository sellerStoreRepository, UserRepository userRepository) {
        this.sellerStoreRepository = sellerStoreRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public StoreDetailsResponse createOrUpdateStore(String phone, StoreDetailsRequest request) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Clean and normalize link
        String normalizedLink = request.getStoreLink().trim().toLowerCase().replaceAll("\\s+", "-");

        // Validate unique link
        boolean exists = sellerStoreRepository.existsByStoreLink(normalizedLink);
        SellerStore existing = sellerStoreRepository.findByUser(user).orElse(null);

        if (exists && (existing == null || !existing.getStoreLink().equals(normalizedLink))) {
            throw new BadRequestException("Store link already in use. Try another.");
        }

        // Create or update store
        if (existing == null) {
            existing = SellerStore.builder()
                    .storeName(request.getStoreName())
                    .storeLink(normalizedLink)
                    .user(user)
                    .build();
        } else {
            existing.setStoreName(request.getStoreName());
            existing.setStoreLink(normalizedLink);
        }

        sellerStoreRepository.save(existing);

        return new StoreDetailsResponse(
                existing.getStoreName(),
                BASE_URL + existing.getStoreLink(),
                user.getFullName(),
                user.getPhone()
        );
    }

    public StoreDetailsResponse getStore(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BadRequestException("User not found"));

        SellerStore store = sellerStoreRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Store details not found"));

        return new StoreDetailsResponse(
                store.getStoreName(),
                BASE_URL + store.getStoreLink(),
                user.getFullName(),
                user.getPhone()
        );
    }
}
