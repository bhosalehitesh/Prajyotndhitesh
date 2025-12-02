package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;

import java.util.NoSuchElementException;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;
import com.smartbiz.sakhistore.modules.store.repository.BusinessDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class BusinessDetailsService {



    @Autowired

    private BusinessDetailsRepo businessDetailsRepository;



    // ✅ Get all business details

    public List<BusinessDetails> allBusinessDetails() {

        return businessDetailsRepository.findAll();

    }



    // ✅ Add or update business details

    public BusinessDetails addBusinessDetails(BusinessDetails details) {

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

