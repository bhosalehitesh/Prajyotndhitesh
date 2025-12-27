package com.smartbiz.sakhistore.modules.store.service;


import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.smartbiz.sakhistore.modules.store.model.StoreAddress;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.StoreAddressRepo;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class StoreAddressService {



    @Autowired

    private StoreAddressRepo storeAddressRepository;

    @Autowired

    private StoreDetailsRepo storeDetailsRepository;
    
    @PersistenceContext
    private EntityManager entityManager;



    // ✅ Get all store addresses (filtered by seller)
    public List<StoreAddress> allAddresses(Long sellerId) {
        if (sellerId != null) {
            return storeAddressRepository.findByStoreDetails_Seller_SellerId(sellerId);
        }
        return storeAddressRepository.findAll();
    }
    
    // ✅ Get all store addresses (backward compatibility - returns all, should be avoided)
    public List<StoreAddress> allAddresses() {
        return storeAddressRepository.findAll();
    }



    // ✅ Add or update store address (using StoreAddress entity - for backward compatibility)
    public StoreAddress addAddress(StoreAddress address) {
        // CRITICAL: Ensure storeDetails is always set before saving
        StoreDetails storeDetails;
        final Long storeId;
        
        // If storeDetails is provided with a storeId, fetch the actual StoreDetails entity
        if (address.getStoreDetails() != null && address.getStoreDetails().getStoreId() != null) {
            storeId = address.getStoreDetails().getStoreId();
            storeDetails = storeDetailsRepository.findById(storeId)
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));
        } else {
            // If storeDetails is not provided or doesn't have storeId, throw error
            // Addresses MUST be linked to a store
            throw new IllegalArgumentException("StoreDetails with valid storeId is required. Cannot save address without store_id.");
        }
        
        // Check if address already exists for this store (one-to-one relationship)
        Optional<StoreAddress> existingAddress = storeAddressRepository.findByStoreDetails_StoreId(storeId);
        
        if (existingAddress.isPresent()) {
            // Update existing address - copy all fields from the new address
            StoreAddress existing = existingAddress.get();
            existing.setShopNoBuildingCompanyApartment(address.getShopNoBuildingCompanyApartment());
            existing.setAreaStreetSectorVillage(address.getAreaStreetSectorVillage());
            existing.setLandmark(address.getLandmark());
            existing.setPincode(address.getPincode());
            existing.setTownCity(address.getTownCity());
            existing.setState(address.getState());
            existing.setStoreDetails(storeDetails); // Ensure relationship is set
            return storeAddressRepository.save(existing);
        } else {
            // New address - ensure storeDetails is set
            address.setStoreDetails(storeDetails);
            return storeAddressRepository.save(address);
        }
    }

    // ✅ Add or update store address (using DTO with direct storeId)
    public StoreAddress addAddressFromRequest(com.smartbiz.sakhistore.modules.store.dto.StoreAddressRequest request) {
        StoreAddress address;
        
        // ✅ Fetch and set StoreDetails if storeId is provided
        // CRITICAL: Always fetch StoreDetails fresh from database to ensure it's a managed entity
        // This is essential for the foreign key (store_id) to be persisted correctly
        StoreDetails storeDetails = null;
        if (request.getStoreId() != null) {
            System.out.println("🔍 [StoreAddressService] Fetching StoreDetails from database for storeId: " + request.getStoreId());
            storeDetails = storeDetailsRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + request.getStoreId()));
            
            // ✅ Verify StoreDetails is properly loaded
            if (storeDetails != null && storeDetails.getStoreId() != null) {
                System.out.println("✅ [StoreAddressService] StoreDetails loaded successfully. StoreId: " + storeDetails.getStoreId());
            } else {
                System.out.println("❌ [StoreAddressService] ERROR: StoreDetails loaded but storeId is NULL!");
                throw new IllegalStateException("StoreDetails loaded but storeId is null");
            }
            
            // Check if address already exists for this store (one-to-one relationship)
            Optional<StoreAddress> existingAddress = storeAddressRepository.findByStoreDetails_StoreId(request.getStoreId());
            
            if (existingAddress.isPresent()) {
                // ✅ Update existing address ONLY if it belongs to this store
                System.out.println("🔄 [StoreAddressService] Address already exists for this store (ID: " + request.getStoreId() + "), updating existing address (ID: " + existingAddress.get().getAddressId() + ")");
                address = existingAddress.get();
            } else {
                // ✅ CREATE NEW ADDRESS for new users/stores
                // Don't link orphaned addresses automatically - let fix-orphaned endpoint handle that
                System.out.println("🆕 [StoreAddressService] No address exists for this store (ID: " + request.getStoreId() + "), creating NEW address row");
                address = new StoreAddress();
                
                // ✅ CRITICAL: Ensure StoreDetails is properly managed and set before saving
                // This ensures the foreign key (store_id) will be persisted correctly
                System.out.println("🔗 [StoreAddressService] Setting storeDetails relationship for foreign key...");
                System.out.println("   - StoreDetails object: " + (storeDetails != null ? "NOT NULL" : "NULL"));
                System.out.println("   - StoreDetails.getStoreId(): " + (storeDetails != null ? storeDetails.getStoreId() : "NULL"));
                
                // Set the relationship - this will establish the foreign key
                address.setStoreDetails(storeDetails);
                
                // ✅ Verify the relationship is set correctly
                if (address.getStoreDetails() != null && address.getStoreDetails().getStoreId() != null) {
                    System.out.println("✅ [StoreAddressService] StoreDetails relationship set successfully. StoreId: " + address.getStoreDetails().getStoreId());
                } else {
                    System.out.println("❌ [StoreAddressService] ERROR: StoreDetails relationship not set correctly!");
                    throw new IllegalStateException("Failed to set StoreDetails relationship for new address");
                }
                
                System.out.println("✅ [StoreAddressService] New address object created for store (ID: " + request.getStoreId() + ")");
            }
        } else {
            // No storeId provided, create new address
            address = new StoreAddress();
        }
        
        // Update address fields
        System.out.println("🔄 [StoreAddressService] Setting address fields...");
        address.setShopNoBuildingCompanyApartment(request.getShopNoBuildingCompanyApartment());
        address.setAreaStreetSectorVillage(request.getAreaStreetSectorVillage());
        address.setLandmark(request.getLandmark());
        address.setPincode(request.getPincode());
        address.setTownCity(request.getTownCity());
        address.setState(request.getState());
        
        System.out.println("📝 [StoreAddressService] Address fields set:");
        System.out.println("   - shopNoBuildingCompanyApartment: " + address.getShopNoBuildingCompanyApartment());
        System.out.println("   - areaStreetSectorVillage: " + address.getAreaStreetSectorVillage());
        System.out.println("   - landmark: " + address.getLandmark());
        System.out.println("   - townCity: " + address.getTownCity());
        System.out.println("   - state: " + address.getState());
        System.out.println("   - pincode: " + address.getPincode());
        
        // CRITICAL: Ensure storeDetails is ALWAYS set before saving
        // Addresses MUST be linked to a store - throw error if storeId was not provided
        if (storeDetails == null) {
            System.out.println("❌ [StoreAddressService] ERROR: storeDetails is NULL!");
            throw new IllegalArgumentException("StoreId is required. Cannot save address without store_id.");
        }
        
        // ✅ CRITICAL: Ensure storeDetails is ALWAYS set and properly managed
        // This is essential for the foreign key (store_id) to be persisted correctly
        if (address.getStoreDetails() == null) {
            System.out.println("⚠️ [StoreAddressService] address.storeDetails is null, setting it now...");
            address.setStoreDetails(storeDetails);
        } else {
            // ✅ Ensure we're using the fully loaded StoreDetails object from persistence context
            // This prevents issues with detached entities
            if (!address.getStoreDetails().getStoreId().equals(storeDetails.getStoreId())) {
                System.out.println("⚠️ [StoreAddressService] StoreDetails mismatch detected, re-setting with managed entity...");
                address.setStoreDetails(storeDetails);
            }
        }
        
        // ✅ FINAL VALIDATION: Double-check that storeDetails has a valid storeId before saving
        if (address.getStoreDetails() == null || address.getStoreDetails().getStoreId() == null) {
            System.out.println("❌ [StoreAddressService] CRITICAL ERROR: address.storeDetails or storeId is NULL!");
            throw new IllegalArgumentException("CRITICAL: Cannot save address without a valid store_id. StoreDetails must have a non-null storeId.");
        }
        
        // ✅ Verify the foreign key will be set correctly
        Long storeIdToSave = address.getStoreDetails().getStoreId();
        System.out.println("✅ [StoreAddressService] Validation passed. StoreId (foreign key): " + storeIdToSave);
        System.out.println("   - StoreDetails object is managed: " + (storeDetails != null ? "YES" : "NO"));
        System.out.println("   - Foreign key (store_id) will be saved as: " + storeIdToSave);
        
        // ✅ Log whether this is a new address or update
        boolean isNewAddress = (address.getAddressId() == null);
        if (isNewAddress) {
            System.out.println("🆕 [StoreAddressService] Creating NEW address row in database for store (ID: " + address.getStoreDetails().getStoreId() + ")");
        } else {
            System.out.println("🔄 [StoreAddressService] Updating EXISTING address (ID: " + address.getAddressId() + ") for store (ID: " + address.getStoreDetails().getStoreId() + ")");
        }
        
        System.out.println("💾 [StoreAddressService] Saving address to database...");
        System.out.println("   - Pre-save: address.storeDetails.storeId = " + (address.getStoreDetails() != null ? address.getStoreDetails().getStoreId() : "NULL"));

        // ✅ Save the address - JPA will persist the foreign key (store_id)
        StoreAddress savedAddress = storeAddressRepository.save(address);
        
        // ✅ CRITICAL: Flush immediately to ensure foreign key is written to database
        // This forces JPA to execute the INSERT/UPDATE immediately
        storeAddressRepository.flush();
        System.out.println("💾 [StoreAddressService] Flushed to database - foreign key should be persisted now");
        
        // ✅ Refresh to ensure we have the latest data from database (including foreign key)
        entityManager.refresh(savedAddress);
        System.out.println("🔄 [StoreAddressService] Refreshed address from database to verify foreign key");
        
        if (isNewAddress) {
            System.out.println("✅ [StoreAddressService] NEW address created in database! AddressId: " + savedAddress.getAddressId());
        } else {
            System.out.println("✅ [StoreAddressService] Address updated in database! AddressId: " + savedAddress.getAddressId());
        }
        
        // ✅ POST-SAVE VALIDATION: Verify that the saved address has a store_id
        // This is a safety check to catch any issues with the save operation
        if (savedAddress.getStoreDetails() == null || savedAddress.getStoreDetails().getStoreId() == null) {
            System.out.println("❌ [StoreAddressService] CRITICAL ERROR: Saved address has NULL store_id! Deleting...");
            // If somehow the address was saved without store_id, delete it and throw error
            storeAddressRepository.delete(savedAddress);
            storeAddressRepository.flush();
            throw new IllegalStateException("CRITICAL ERROR: Address was saved without store_id. The address has been deleted. Please try again.");
        }
        
        Long finalStoreId = savedAddress.getStoreDetails().getStoreId();
        System.out.println("✅ [StoreAddressService] Post-save validation passed.");
        System.out.println("   - Final addressId: " + savedAddress.getAddressId());
        System.out.println("   - Final storeId (foreign key): " + finalStoreId);
        System.out.println("   - Foreign key (store_id) is correctly set in database: " + (finalStoreId != null ? "YES ✅" : "NO ❌"));
        System.out.println("✅ [StoreAddressService] Address successfully saved to database with ID: " + savedAddress.getAddressId() + " and store_id: " + finalStoreId);
        
        return savedAddress;
    }



    // ✅ Get store address by ID

    public StoreAddress findById(Long addressId) {

        return storeAddressRepository.findById(addressId)

                .orElseThrow(() -> new NoSuchElementException("Store Address not found with ID: " + addressId));

    }



    // ✅ Delete store address

    public void deleteAddress(Long addressId) {

        StoreAddress address = storeAddressRepository.findById(addressId)

                .orElseThrow(() -> new NoSuchElementException("Store Address not found with ID: " + addressId));

        storeAddressRepository.delete(address);

    }

    // ✅ Fix orphaned addresses (addresses with null store_id) for a specific seller
    // Links the most recent orphaned address to the seller's store
    public StoreAddress fixOrphanedAddressForSeller(Long sellerId) {
        // Find the seller's store
        List<StoreDetails> stores = storeDetailsRepository.findBySeller_SellerId(sellerId);
        if (stores.isEmpty()) {
            throw new NoSuchElementException("Store not found for sellerId: " + sellerId);
        }
        StoreDetails store = stores.get(0);
        
        // Check if store already has an address
        Optional<StoreAddress> existingAddress = storeAddressRepository.findByStoreDetails_StoreId(store.getStoreId());
        if (existingAddress.isPresent()) {
            // Store already has an address, return it
            return existingAddress.get();
        }
        
        // Find orphaned addresses (null store_id), ordered by addressId descending (most recent first)
        List<StoreAddress> orphanedAddresses = storeAddressRepository.findByStoreDetailsIsNull();
        if (orphanedAddresses.isEmpty()) {
            throw new NoSuchElementException("No orphaned addresses found to link");
        }
        
        // Link the most recent orphaned address to this store
        StoreAddress orphanedAddress = orphanedAddresses.get(0); // Get first (most recent if sorted)
        orphanedAddress.setStoreDetails(store);
        return storeAddressRepository.save(orphanedAddress);
    }
    
    // ✅ Fix ALL orphaned addresses by matching them to stores without addresses
    // Uses intelligent matching: matches most recent orphaned addresses to most recent stores
    // This is an admin utility method to fix all orphaned addresses in the database
    public int fixAllOrphanedAddresses() {
        // Get all orphaned addresses (null store_id)
        List<StoreAddress> orphanedAddresses = storeAddressRepository.findByStoreDetailsIsNull();
        if (orphanedAddresses.isEmpty()) {
            System.out.println("✅ [StoreAddressService] No orphaned addresses found to fix");
            return 0;
        }
        
        // ✅ Sort orphaned addresses by addressId descending (most recent first)
        orphanedAddresses.sort((a, b) -> {
            Long idA = a.getAddressId() != null ? a.getAddressId() : 0L;
            Long idB = b.getAddressId() != null ? b.getAddressId() : 0L;
            return Long.compare(idB, idA); // Descending order
        });
        
        // Get all stores
        List<StoreDetails> allStores = storeDetailsRepository.findAll();
        
        // ✅ Sort stores by storeId descending (most recent first) for better matching
        allStores.sort((a, b) -> {
            Long idA = a.getStoreId() != null ? a.getStoreId() : 0L;
            Long idB = b.getStoreId() != null ? b.getStoreId() : 0L;
            return Long.compare(idB, idA); // Descending order
        });
        
        // Find stores without addresses
        List<StoreDetails> storesWithoutAddresses = new java.util.ArrayList<>();
        for (StoreDetails store : allStores) {
            Optional<StoreAddress> existingAddress = storeAddressRepository.findByStoreDetails_StoreId(store.getStoreId());
            if (!existingAddress.isPresent()) {
                storesWithoutAddresses.add(store);
            }
        }
        
        if (storesWithoutAddresses.isEmpty()) {
            System.out.println("⚠️ [StoreAddressService] No stores without addresses found to link orphaned addresses");
            return 0;
        }
        
        int fixedCount = 0;
        int minSize = Math.min(orphanedAddresses.size(), storesWithoutAddresses.size());
        
        // ✅ Match most recent orphaned addresses to most recent stores without addresses
        for (int i = 0; i < minSize; i++) {
            StoreAddress orphanedAddress = orphanedAddresses.get(i);
            StoreDetails store = storesWithoutAddresses.get(i);
            
            // Link the orphaned address to the store
            orphanedAddress.setStoreDetails(store);
            storeAddressRepository.save(orphanedAddress);
            System.out.println("✅ [StoreAddressService] Fixed orphaned address (ID: " + orphanedAddress.getAddressId() + ") by linking to store (ID: " + store.getStoreId() + ", Name: " + store.getStoreName() + ")");
            fixedCount++;
        }
        
        if (orphanedAddresses.size() > storesWithoutAddresses.size()) {
            System.out.println("⚠️ [StoreAddressService] " + (orphanedAddresses.size() - storesWithoutAddresses.size()) + " orphaned address(es) could not be fixed (no available stores without addresses)");
        }
        
        System.out.println("✅ [StoreAddressService] Fixed " + fixedCount + " orphaned address(es)");
        return fixedCount;
    }

}
