package com.smartbiz.sakhistore.modules.pincode.service;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartbiz.sakhistore.modules.pincode.DTOs.PincodeResponseDTO;
import com.smartbiz.sakhistore.modules.pincode.DTOs.PincodeSearchDTO;
import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.repository.PincodeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PincodeServiceImpl  {

    private final PincodeRepository repo;

	
    public Optional<Pincode> findByPincode(String pincode) {
        return repo.findByPincode(pincode);
    }

   
    public List<String> getAllStates() {
        return repo.findAllStates();
    }

   
    public List<String> getDistricts(String state) {
        return repo.findDistrictsByState(state);
    }

   
    public List<String> getCities(String state, String district) {
        return repo.findCities(state, district);
    }

   
    public boolean existsByPincode(String pincode) {
        return repo.findByPincode(pincode).isPresent();
    }

    
    public long countPincodes() {
        return repo.count();
    }

   
    public void saveAllPincodes(List<Pincode> list) {
        repo.saveAll(list);
    }

   
    public List<Pincode> search(String prefix) {
        return repo.searchByPrefix(prefix);
    }

    
    public PincodeResponseDTO toDTO(Pincode p) {
        return new PincodeResponseDTO(
                p.getPincode(), p.getState(), p.getDistrict(), p.getCity(), p.getRegion()
        );
    }

    
    public List<PincodeSearchDTO> toSearchDTO(List<Pincode> list) {
        return list.stream()
                .map(p -> new PincodeSearchDTO(
                        p.getPincode(),
                        p.getCity(),
                        p.getDistrict(),
                        p.getState()
                ))
                .toList();
    }
}
