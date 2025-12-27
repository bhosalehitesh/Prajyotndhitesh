package com.smartbiz.sakhistore.modules.pincode.controller;

import java.util.List; 
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartbiz.sakhistore.modules.pincode.DTOs.PincodeSearchDTO;
import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.service.PincodeServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pincode")
@RequiredArgsConstructor
public class PincodeController {

  
	private final PincodeServiceImpl service;

	@GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam String pincode) {

        Optional<Pincode> p = service.findByPincode(pincode);

        if (p.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "message", "Invalid pincode"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "data", service.toDTO(p.get())
        ));
    }

    @GetMapping("/states")
    public List<String> getStates() {
        return service.getAllStates();
    }

    @GetMapping("/districts")
    public List<String> getDistricts(@RequestParam String state) {
        return service.getDistricts(state);
    }

    @GetMapping("/cities")
    public List<String> getCities(@RequestParam String state,
                                  @RequestParam String district) {
        return service.getCities(state, district);
    }

    @GetMapping("/search")
    public List<PincodeSearchDTO> search(@RequestParam String prefix) {
        return service.toSearchDTO(service.search(prefix));
    }
}
