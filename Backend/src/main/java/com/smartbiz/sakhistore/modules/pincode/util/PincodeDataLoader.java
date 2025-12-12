package com.smartbiz.sakhistore.modules.pincode.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.service.PincodeServiceImpl;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PincodeDataLoader implements CommandLineRunner {

    private final PincodeServiceImpl service;   // ✔ must be interface, not Impl


	@Override
    public void run(String... args) {

        if (service.countPincodes() > 0) {
            System.out.println("Pincodes already loaded.");
            return;
        }

        System.out.println("Loading pincode dataset...");

        List<Pincode> list = new ArrayList<>();

        // EXAMPLES
        add(list, "Maharashtra", "Mumbai", "Mumbai", "400001");
        add(list, "Maharashtra", "Pune", "Pune", "411001");
        add(list, "Gujarat", "Ahmedabad", "Ahmedabad", "380001");

        List<Pincode> uniqueList = list.stream()
                .filter(p -> !service.existsByPincode(p.getPincode()))
                .toList();

        service.saveAllPincodes(uniqueList);

        System.out.println("Loaded pincodes: " + uniqueList.size());
    }

    private void add(List<Pincode> list, String state, String district, String city, String pin) {

        Pincode p = new Pincode();
        p.setPincode(pin);
        p.setState(state);
        p.setDistrict(district);
        p.setCity(city);
        p.setRegion(getRegion(state));

        list.add(p);
    }

    private String getRegion(String state) {
        return switch (state) {
            case "Maharashtra", "Goa", "Gujarat" -> "West";
            case "Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana" -> "South";
            case "Uttar Pradesh", "Bihar", "Jharkhand", "West Bengal", "Odisha" -> "East";
            case "Punjab", "Haryana", "Delhi", "Rajasthan", "Uttarakhand", "Himachal Pradesh" -> "North";
            case "Madhya Pradesh", "Chhattisgarh" -> "Central";
            default -> "Northeast";
        };
    }
}
