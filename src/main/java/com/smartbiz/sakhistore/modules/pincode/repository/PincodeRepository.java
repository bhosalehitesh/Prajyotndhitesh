package com.smartbiz.sakhistore.modules.pincode.repository;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PincodeRepository extends JpaRepository<Pincode, Long> {

    Optional<Pincode> findByPincode(String pincode);

    @Query("SELECT DISTINCT p.state FROM Pincode p ORDER BY p.state")
    List<String> findAllStates();

    @Query("SELECT DISTINCT p.district FROM Pincode p WHERE p.state = :state ORDER BY p.district")
    List<String> findDistrictsByState(String state);

    @Query("SELECT DISTINCT p.city FROM Pincode p WHERE p.state = :state AND p.district = :district ORDER BY p.city")
    List<String> findCities(String state, String district);

    @Query("SELECT p FROM Pincode p WHERE p.pincode LIKE :prefix%")
    List<Pincode> searchByPrefix(String prefix);
}
