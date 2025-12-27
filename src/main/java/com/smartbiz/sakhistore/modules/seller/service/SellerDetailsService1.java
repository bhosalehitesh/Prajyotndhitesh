package com.smartbiz.sakhistore.modules.seller.service;

import java.util.List;

import java.util.NoSuchElementException;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class SellerDetailsService1 {



    @Autowired

    private SellerDetailsRepo sellerDetailsRepository;



    // ✅ Get all sellers

    public List<SellerDetails> allSellers() {

        return sellerDetailsRepository.findAll();

    }



    // ✅ Add or update seller

    public SellerDetails addSeller(SellerDetails seller) {

        return sellerDetailsRepository.save(seller);

    }



    // ✅ Find seller by ID

    public SellerDetails findByIdSD(Long sellerId) {

        return sellerDetailsRepository.findById(sellerId)

                .orElseThrow(() -> new NoSuchElementException("Seller not found with ID: " + sellerId));

    }



    // ✅ Delete seller

    public void deleteSeller(Long sellerId) {

        SellerDetails seller = findByIdSD(sellerId);

        sellerDetailsRepository.delete(seller);

    }

}