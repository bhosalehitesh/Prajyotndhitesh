package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



import com.smartbiz.sakhistore.modules.store.model.StoreAddress;
import com.smartbiz.sakhistore.modules.store.service.StoreAddressService;

import lombok.RequiredArgsConstructor;



@RestController

@RequestMapping("/api/store-address")

@RequiredArgsConstructor

public class StoreAddressController {



    @Autowired

    private StoreAddressService storeAddressService;



    // Get all store addresses

    @GetMapping("/allAddresses")

    public List<StoreAddress> allAddresses() {

        return storeAddressService.allAddresses();

    }



    // Add new store address

    @PostMapping("/addAddress")

    public StoreAddress addAddress(@RequestBody StoreAddress address) {

        return storeAddressService.addAddress(address);

    }



    //  Edit store address

    @PostMapping("/editAddress")

    public StoreAddress editAddress(@RequestBody StoreAddress address) {

        return storeAddressService.addAddress(address);

    }



    //  Get store address by ID

    @GetMapping("/{addressId}")

    public StoreAddress getAddress(@PathVariable Long addressId) {

        return storeAddressService.findById(addressId);

    }



    // Delete store address

    @DeleteMapping("/{id}")

    public ResponseEntity<String> deleteAddress(@PathVariable Long id) {

        storeAddressService.deleteAddress(id);

        return ResponseEntity.ok("✅ Store Address with ID " + id + " deleted successfully.");

    }

}