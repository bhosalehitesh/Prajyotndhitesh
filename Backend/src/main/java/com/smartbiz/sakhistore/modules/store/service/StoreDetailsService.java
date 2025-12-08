package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class StoreDetailsService {

    @Value("${app.store.domain}")
    private String domain;



    @Autowired
    private StoreDetailsRepo storeRepository;

    @Autowired
    private CloudinaryHelper cloudinaryHelper;

    @Autowired
    private SellerDetailsRepo sellerRepository;



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



    // ✅ Find store by Seller ID (assumes one store per seller)
    public StoreDetails findBySellerId(Long sellerId) {
        return storeRepository.findBySeller_SellerId(sellerId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Store not found for sellerId: " + sellerId));
    }

    // ✅ Delete store
    public void deleteStore(Long storeId) {

        StoreDetails store = storeRepository.findById(storeId)

                .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));

        storeRepository.delete(store);

    }

    //for link this logic

    // ---------------------- CREATE ----------------------
    public StoreDetails addStore(StoreDetails store, Long sellerId) {
        // ✅ VALIDATION: Seller ID is required
        if (sellerId == null) {
            throw new RuntimeException("Seller ID is required! Cannot create store without linking to a seller.");
        }

        // ✅ VALIDATION: Check if seller exists
        SellerDetails seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with ID: " + sellerId + ". Please create seller first."));

        // ✅ VALIDATION: Check if seller already has a store
        try {
            findBySellerId(sellerId);
            throw new RuntimeException("Seller already has a store! One seller can only have one store.");
        } catch (NoSuchElementException e) {
            // Seller doesn't have a store yet - this is good, continue
        }

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

        // ✅ CRITICAL: Link store to seller (prevents null seller_id)
        store.setSeller(seller);

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
    }

    // Check if store name is available
    public boolean isStoreNameAvailable(String storeName) {
        if (storeName == null || storeName.trim().isEmpty()) {
            return false;
        }
        return !storeRepository.existsByStoreName(storeName.trim());
    }

    // Upload logo for a store
    public StoreDetails uploadLogo(Long storeId, MultipartFile logoFile) {
        StoreDetails store = findByIdDS(storeId);
        
        // Upload logo to Cloudinary
        String logoUrl = cloudinaryHelper.saveImage(logoFile);
        
        if (logoUrl == null) {
            throw new RuntimeException("Failed to upload logo. Please try again.");
        }
        
        // Save logo URL to store
        store.setLogoUrl(logoUrl);
        return storeRepository.save(store);
    }

    // Upload logo for a store by seller ID
    public StoreDetails uploadLogoBySellerId(Long sellerId, MultipartFile logoFile) {
        StoreDetails store = findBySellerId(sellerId);
        
        // Upload logo to Cloudinary
        String logoUrl = cloudinaryHelper.saveImage(logoFile);
        
        if (logoUrl == null) {
            throw new RuntimeException("Failed to upload logo. Please try again.");
        }
        
        // Save logo URL to store
        store.setLogoUrl(logoUrl);
        return storeRepository.save(store);
    }
}