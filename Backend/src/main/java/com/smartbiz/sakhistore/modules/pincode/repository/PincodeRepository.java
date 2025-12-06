package com.smartbiz.sakhistore.modules.pincode.repository;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PincodeRepository extends JpaRepository<Pincode, Long> {
    
    // Find pincode by exact pincode value
    Optional<Pincode> findByPincode(String pincode);
    
    // Find all pincodes for a state
    List<Pincode> findByStateOrderByCityAsc(String state);
    
    // Find all districts for a state (distinct)
    @Query("SELECT DISTINCT p.district FROM Pincode p WHERE p.state = :state ORDER BY p.district ASC")
    List<String> findDistinctDistrictsByState(@Param("state") String state);
    
    // Find all cities for a district in a state
    @Query("SELECT DISTINCT p.city FROM Pincode p WHERE p.state = :state AND p.district = :district ORDER BY p.city ASC")
    List<String> findDistinctCitiesByStateAndDistrict(@Param("state") String state, @Param("district") String district);
    
    // Find all cities for a state (distinct)
    @Query("SELECT DISTINCT p.city FROM Pincode p WHERE p.state = :state ORDER BY p.city ASC")
    List<String> findDistinctCitiesByState(@Param("state") String state);
    
    // Find all pincodes for a city in a state
    List<Pincode> findByStateAndCityOrderByPincodeAsc(String state, String city);
    
    // Find all pincodes for a district
    List<Pincode> findByStateAndDistrictOrderByCityAsc(String state, String district);
    
    // Check if pincode exists for a state
    boolean existsByPincodeAndState(String pincode, String state);
    
    // Find all states (distinct)
    @Query("SELECT DISTINCT p.state FROM Pincode p ORDER BY p.state ASC")
    List<String> findAllDistinctStates();
    
    // Search pincodes by partial match
    @Query("SELECT p FROM Pincode p WHERE p.pincode LIKE :pincode% ORDER BY p.pincode ASC")
    List<Pincode> findByPincodeStartingWith(@Param("pincode") String pincode);
}


