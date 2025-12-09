package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;

import java.util.NoSuchElementException;



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
            address.setStoreDetails(storeDetails);
        }
        return storeAddressRepository.save(address);
    }

    // ✅ Add or update store address (using DTO with direct storeId)
    public StoreAddress addAddressFromRequest(com.smartbiz.sakhistore.modules.store.dto.StoreAddressRequest request) {
        StoreAddress address = new StoreAddress();
        address.setShopNoBuildingCompanyApartment(request.getShopNoBuildingCompanyApartment());
        address.setAreaStreetSectorVillage(request.getAreaStreetSectorVillage());
        address.setLandmark(request.getLandmark());
        address.setPincode(request.getPincode());
        address.setTownCity(request.getTownCity());
        address.setState(request.getState());

        // Fetch and set StoreDetails if storeId is provided
        if (request.getStoreId() != null) {
            StoreDetails storeDetails = storeDetailsRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + request.getStoreId()));
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
