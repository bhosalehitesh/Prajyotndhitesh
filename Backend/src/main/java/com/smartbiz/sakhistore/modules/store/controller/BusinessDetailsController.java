package com.smartbiz.sakhistore.modules.store.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbiz.sakhistore.modules.store.dto.BusinessDetailsRequest;
import com.smartbiz.sakhistore.modules.store.model.BusinessDetails;
import com.smartbiz.sakhistore.modules.store.service.BusinessDetailsService;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/business-details")
@RequiredArgsConstructor
public class BusinessDetailsController {

    @Autowired
    private BusinessDetailsService businessDetailsService;

    // ✅ Get all
    @GetMapping("/allBusinessDetails")
    public List<BusinessDetails> allBusinessDetails() {
        return businessDetailsService.allBusinessDetails();
    }



    // ✅ Add new (accepts DTO with storeId directly)
    @PostMapping("/addBusinessDetails")
    public BusinessDetails addBusinessDetails(@RequestBody BusinessDetailsRequest request) {
        // Use the DTO method which handles storeId directly
        if (request.getStoreId() != null) {
            return businessDetailsService.addBusinessDetailsFromRequest(request);
        }
        
        // Fallback: create BusinessDetails without storeId
        BusinessDetails details = new BusinessDetails();
        details.setBusinessDescription(request.getBusinessDescription());
        details.setOwnBusiness(request.getOwnBusiness());
        details.setBusinessSize(request.getBusinessSize());
        details.setPlatform(request.getPlatform());
        return businessDetailsService.addBusinessDetails(details);
    }
    
    // ✅ Add new (backward compatibility - accepts BusinessDetails entity)
    @PostMapping("/addBusinessDetailsLegacy")
    public BusinessDetails addBusinessDetailsLegacy(@RequestBody BusinessDetails details) {
        return businessDetailsService.addBusinessDetails(details);
    }



    // ✅ Edit

    @PostMapping("/editBusinessDetails")

    public BusinessDetails editBusinessDetails(@RequestBody BusinessDetails details) {

        return businessDetailsService.addBusinessDetails(details);

    }



    // ✅ Get by ID

    @GetMapping("/{businessId}")

    public BusinessDetails getBusinessDetails(@PathVariable Long businessId) {

        return businessDetailsService.findById(businessId);

    }



    // ✅ Delete

    @DeleteMapping("/{id}")

    public ResponseEntity<String> deleteBusinessDetails(@PathVariable Long id) {

        businessDetailsService.deleteBusinessDetails(id);

        return ResponseEntity.ok("✅ Business Details with ID " + id + " deleted successfully.");

    }

}

