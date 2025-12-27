package com.smartbiz.sakhistore.modules.store.service;


import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // If storeDetails is provided with a storeId, fetch the actual StoreDetails entity
        if (address.getStoreDetails() != null && address.getStoreDetails().getStoreId() != null) {
            Long storeId = address.getStoreDetails().getStoreId();
            StoreDetails storeDetails = storeDetailsRepository.findById(storeId)
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));
            
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
                existing.setStoreDetails(storeDetails);
                return storeAddressRepository.save(existing);
            } else {
                // New address - ensure storeDetails is set
                address.setStoreDetails(storeDetails);
            }
        }
        return storeAddressRepository.save(address);
    }

    // ✅ Add or update store address (using DTO with direct storeId)
    public StoreAddress addAddressFromRequest(com.smartbiz.sakhistore.modules.store.dto.StoreAddressRequest request) {
        StoreAddress address;
        
        // Fetch and set StoreDetails if storeId is provided
        StoreDetails storeDetails = null;
        if (request.getStoreId() != null) {
            storeDetails = storeDetailsRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + request.getStoreId()));
            
            // Check if address already exists for this store (one-to-one relationship)
            Optional<StoreAddress> existingAddress = storeAddressRepository.findByStoreDetails_StoreId(request.getStoreId());
            
            if (existingAddress.isPresent()) {
                // Update existing address
                address = existingAddress.get();
            } else {
                // Create new address
                address = new StoreAddress();
                address.setStoreDetails(storeDetails);
            }
        } else {
            // No storeId provided, create new address
            address = new StoreAddress();
        }
        
        // Update address fields
        address.setShopNoBuildingCompanyApartment(request.getShopNoBuildingCompanyApartment());
        address.setAreaStreetSectorVillage(request.getAreaStreetSectorVillage());
        address.setLandmark(request.getLandmark());
        address.setPincode(request.getPincode());
        address.setTownCity(request.getTownCity());
        address.setState(request.getState());
        
        // Ensure storeDetails is set (in case it wasn't set above)
        if (address.getStoreDetails() == null && storeDetails != null) {
            address.setStoreDetails(storeDetails);
        }

        return storeAddressRepository.save(address);
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

}
