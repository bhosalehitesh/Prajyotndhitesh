package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class StoreDetailsService {

    @Value("${app.store.domain}")
    private String domain;



    @Autowired
    private StoreDetailsRepo storeRepository;



    // ✅ Get all stores

    public List<StoreDetails> allStores() {

        return storeRepository.findAll();

    }



    // ✅ Add or update store




    // ✅ Find store by ID

    public StoreDetails findByIdDS(Long storeId) {

        return storeRepository.findById(storeId)

                .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));

    }



    // ✅ Delete store

    public void deleteStore(Long storeId) {

        StoreDetails store = storeRepository.findById(storeId)

                .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));

        storeRepository.delete(store);

    }

    //for link this logic

    // ---------------------- CREATE ----------------------
    public StoreDetails addStore(StoreDetails store) {

        // Check unique store name
        if (storeRepository.existsByStoreName(store.getStoreName())) {
            throw new RuntimeException("Store name already exists! Please choose a unique store name.");
        }

        // Generate slug
        String slug = store.getStoreName()
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9\\-]", "");

        // Set the unique store link
        store.setStoreLink(domain + "/" + slug);

        return storeRepository.save(store);
    }

    // ---------------------- UPDATE ----------------------
    public StoreDetails updateStore(Long id, StoreDetails updated) {

        return storeRepository.findById(id).map(store -> {

            // If store name changed → check uniqueness
            if (!store.getStoreName().equals(updated.getStoreName())) {

                if (storeRepository.existsByStoreName(updated.getStoreName())) {
                    throw new RuntimeException("Store name already exists! Choose a different name.");
                }
            }

            store.setStoreName(updated.getStoreName());

            // Regenerate slug
            String slug = updated.getStoreName()
                    .toLowerCase()
                    .trim()
                    .replaceAll("\\s+", "-")
                    .replaceAll("[^a-z0-9\\-]", "");

            store.setStoreLink(domain + "/" + slug);

            return storeRepository.save(store);

        }).orElseThrow(() -> new RuntimeException("Store not found"));
    }}