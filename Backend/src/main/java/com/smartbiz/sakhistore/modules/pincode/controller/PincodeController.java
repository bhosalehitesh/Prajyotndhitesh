package com.smartbiz.sakhistore.modules.pincode.controller;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.service.PincodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pincodes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PincodeController {
    
    private final PincodeService pincodeService;
    
    /**
     * Validate pincode and get details
     * GET /api/pincodes/validate?pincode=411103
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validatePincode(@RequestParam("pincode") String pincode) {
        Optional<Pincode> pincodeDetails = pincodeService.validateAndGetPincodeDetails(pincode);
        
        if (pincodeDetails.isPresent()) {
            Pincode p = pincodeDetails.get();
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("pincode", p.getPincode());
            response.put("state", p.getState());
            response.put("district", p.getDistrict());
            response.put("city", p.getCity());
            response.put("taluka", p.getTaluka());
            response.put("division", p.getDivision());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Invalid pincode");
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Check if pincode is valid for a state
     * GET /api/pincodes/check-state?pincode=411103&state=Maharashtra
     */
    @GetMapping("/check-state")
    public ResponseEntity<?> checkPincodeForState(
            @RequestParam("pincode") String pincode,
            @RequestParam("state") String state) {
        boolean isValid = pincodeService.isPincodeValidForState(pincode, state);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("pincode", pincode);
        response.put("state", state);
        response.put("message", isValid 
            ? "Pincode is valid for the selected state" 
            : "Pincode does not match the selected state");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all districts for a state
     * GET /api/pincodes/districts?state=Maharashtra
     */
    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistrictsByState(@RequestParam("state") String state) {
        List<String> districts = pincodeService.getDistrictsByState(state);
        return ResponseEntity.ok(districts);
    }
    
    /**
     * Get all cities for a state
     * GET /api/pincodes/cities?state=Maharashtra
     */
    @GetMapping("/cities")
    public ResponseEntity<?> getCitiesByState(
            @RequestParam("state") String state,
            @RequestParam(value = "district", required = false) String district) {
        List<String> cities;
        
        if (district != null && !district.trim().isEmpty()) {
            cities = pincodeService.getCitiesByStateAndDistrict(state, district);
        } else {
            cities = pincodeService.getCitiesByState(state);
        }
        
        return ResponseEntity.ok(cities);
    }
    
    /**
     * Get all states
     * GET /api/pincodes/states
     */
    @GetMapping("/states")
    public ResponseEntity<List<String>> getAllStates() {
        List<String> states = pincodeService.getAllStates();
        return ResponseEntity.ok(states);
    }
    
    /**
     * Get pincode details by pincode
     * GET /api/pincodes/{pincode}
     */
    @GetMapping("/{pincode}")
    public ResponseEntity<?> getPincodeDetails(@PathVariable String pincode) {
        Optional<Pincode> pincodeDetails = pincodeService.validateAndGetPincodeDetails(pincode);
        
        if (pincodeDetails.isPresent()) {
            return ResponseEntity.ok(pincodeDetails.get());
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Pincode not found");
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Search pincodes by prefix
     * GET /api/pincodes/search?prefix=411
     */
    @GetMapping("/search")
    public ResponseEntity<List<Pincode>> searchPincodes(@RequestParam("prefix") String prefix) {
        List<Pincode> pincodes = pincodeService.searchPincodes(prefix);
        return ResponseEntity.ok(pincodes);
    }
    
    /**
     * Validate if city/village exists in state and district
     * GET /api/pincodes/validate-city?city=Pune&state=Maharashtra&district=Pune
     */
    @GetMapping("/validate-city")
    public ResponseEntity<?> validateCity(
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam(value = "district", required = false) String district) {
        
        boolean isValid = pincodeService.isCityValidForStateAndDistrict(city, state, district);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("city", city);
        response.put("state", state);
        if (district != null) {
            response.put("district", district);
        }
        response.put("message", isValid 
            ? "City/Village is valid for the selected state and district" 
            : "City/Village not found in the selected state and district");
        
        return ResponseEntity.ok(response);
    }
}

