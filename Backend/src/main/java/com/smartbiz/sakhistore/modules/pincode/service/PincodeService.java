package com.smartbiz.sakhistore.modules.pincode.service;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.repository.PincodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PincodeService {
    
    private final PincodeRepository pincodeRepository;
    
    /**
     * Validate pincode and get details (state, district, city)
     */
    public Optional<Pincode> validateAndGetPincodeDetails(String pincode) {
        if (pincode == null || pincode.trim().length() != 6) {
            return Optional.empty();
        }
        return pincodeRepository.findByPincode(pincode.trim());
    }
    
    /**
     * Check if pincode is valid for a specific state
     */
    public boolean isPincodeValidForState(String pincode, String state) {
        if (pincode == null || state == null || pincode.trim().length() != 6) {
            return false;
        }
        return pincodeRepository.existsByPincodeAndState(pincode.trim(), state.trim());
    }
    
    /**
     * Get all districts for a state
     */
    public List<String> getDistrictsByState(String state) {
        if (state == null || state.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findDistinctDistrictsByState(state.trim());
    }
    
    /**
     * Get all cities for a state
     */
    public List<String> getCitiesByState(String state) {
        if (state == null || state.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findDistinctCitiesByState(state.trim());
    }
    
    /**
     * Get all cities for a district in a state
     */
    public List<String> getCitiesByStateAndDistrict(String state, String district) {
        if (state == null || district == null || state.trim().isEmpty() || district.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findDistinctCitiesByStateAndDistrict(state.trim(), district.trim());
    }
    
    /**
     * Get all pincodes for a city in a state
     */
    public List<Pincode> getPincodesByStateAndCity(String state, String city) {
        if (state == null || city == null || state.trim().isEmpty() || city.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findByStateAndCityOrderByPincodeAsc(state.trim(), city.trim());
    }
    
    /**
     * Get all pincodes for a district
     */
    public List<Pincode> getPincodesByStateAndDistrict(String state, String district) {
        if (state == null || district == null || state.trim().isEmpty() || district.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findByStateAndDistrictOrderByCityAsc(state.trim(), district.trim());
    }
    
    /**
     * Get all states
     */
    public List<String> getAllStates() {
        return pincodeRepository.findAllDistinctStates();
    }
    
    /**
     * Search pincodes by partial match
     */
    public List<Pincode> searchPincodes(String pincodePrefix) {
        if (pincodePrefix == null || pincodePrefix.trim().isEmpty()) {
            return List.of();
        }
        return pincodeRepository.findByPincodeStartingWith(pincodePrefix.trim());
    }
    
    /**
     * Save or update pincode
     */
    public Pincode savePincode(Pincode pincode) {
        return pincodeRepository.save(pincode);
    }
    
    /**
     * Bulk save pincodes
     */
    public List<Pincode> saveAllPincodes(List<Pincode> pincodes) {
        return pincodeRepository.saveAll(pincodes);
    }
    
    /**
     * Check if city/village is valid for a state and district
     */
    public boolean isCityValidForStateAndDistrict(String city, String state, String district) {
        if (city == null || state == null || city.trim().isEmpty() || state.trim().isEmpty()) {
            return false;
        }
        
        String cityTrimmed = city.trim();
        String stateTrimmed = state.trim();
        
        if (district != null && !district.trim().isEmpty()) {
            // Check if city exists in the specific district
            List<String> cities = getCitiesByStateAndDistrict(stateTrimmed, district.trim());
            return cities.stream()
                    .anyMatch(c -> c.trim().equalsIgnoreCase(cityTrimmed));
        } else {
            // Check if city exists in the state (any district)
            List<String> cities = getCitiesByState(stateTrimmed);
            return cities.stream()
                    .anyMatch(c -> c.trim().equalsIgnoreCase(cityTrimmed));
        }
    }
}

