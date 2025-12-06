package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;

import java.util.NoSuchElementException;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.repository.BusinessDetailsRepo;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class BusinessDetailsService {



    @Autowired

    private BusinessDetailsRepo businessDetailsRepository;

    @Autowired

    private StoreDetailsRepo storeDetailsRepository;



    // ✅ Get all business details

    public List<BusinessDetails> allBusinessDetails() {

        return businessDetailsRepository.findAll();

    }



    // ✅ Add or update business details (using BusinessDetails entity - for backward compatibility)
    public BusinessDetails addBusinessDetails(BusinessDetails details) {
        // If storeDetails is provided with a storeId, fetch the actual StoreDetails entity
        if (details.getStoreDetails() != null && details.getStoreDetails().getStoreId() != null) {
            Long storeId = details.getStoreDetails().getStoreId();
            StoreDetails storeDetails = storeDetailsRepository.findById(storeId)
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));
            details.setStoreDetails(storeDetails);
        }
        return businessDetailsRepository.save(details);
    }

    // ✅ Add or update business details (using DTO with direct storeId)
    public BusinessDetails addBusinessDetailsFromRequest(com.smartbiz.sakhistore.modules.store.dto.BusinessDetailsRequest request) {
        BusinessDetails details = new BusinessDetails();
        details.setBusinessDescription(request.getBusinessDescription());
        details.setOwnBusiness(request.getOwnBusiness());
        details.setBusinessSize(request.getBusinessSize());
        details.setPlatform(request.getPlatform());

        // Fetch and set StoreDetails if storeId is provided
        if (request.getStoreId() != null) {
            StoreDetails storeDetails = storeDetailsRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + request.getStoreId()));
            details.setStoreDetails(storeDetails);
        }

        return businessDetailsRepository.save(details);
    }



    // ✅ Get business details by ID

    public BusinessDetails findById(Long businessId) {

        return businessDetailsRepository.findById(businessId)

                .orElseThrow(() -> new NoSuchElementException("Business details not found with ID: " + businessId));

    }



    // ✅ Delete business details

    public void deleteBusinessDetails(Long businessId) {

        BusinessDetails details = findById(businessId);

        businessDetailsRepository.delete(details);

    }
}

