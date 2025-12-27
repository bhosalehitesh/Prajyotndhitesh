package com.smartbiz.sakhistore.modules.store.dto;

import com.smartbiz.sakhistore.modules.store.model.*;
import org.springframework.stereotype.Component;

/**
 * Mapper utility to convert Store entities to DTOs
 */
@Component
public class StoreMapper {

    /**
     * Convert StoreDetails entity to StoreDetailsResponseDTO
     */
    public StoreDetailsResponseDTO toStoreDetailsResponseDTO(StoreDetails store) {
        if (store == null) {
            return null;
        }

        StoreDetailsResponseDTO dto = new StoreDetailsResponseDTO();
        dto.setStoreId(store.getStoreId());
        dto.setStoreName(store.getStoreName());
        dto.setStoreLink(store.getStoreLink());
        dto.setLogoUrl(store.getLogoUrl());

        // Seller information
        if (store.getSeller() != null) {
            dto.setSellerId(store.getSeller().getSellerId());
            dto.setSellerPhone(store.getSeller().getPhone());
            dto.setSellerFullName(store.getSeller().getFullName());
        }

        // Store Address
        if (store.getStoreAddress() != null) {
            dto.setStoreAddress(toStoreAddressResponseDTO(store.getStoreAddress()));
        }

        // Business Details
        if (store.getBusinessDetails() != null) {
            dto.setBusinessDetails(toBusinessDetailsResponseDTO(store.getBusinessDetails()));
        }

        return dto;
    }

    /**
     * Convert StoreAddress entity to StoreAddressResponseDTO
     */
    public StoreAddressResponseDTO toStoreAddressResponseDTO(StoreAddress address) {
        if (address == null) {
            return null;
        }

        StoreAddressResponseDTO dto = new StoreAddressResponseDTO();
        dto.setAddressId(address.getAddressId());
        dto.setShopNoBuildingCompanyApartment(address.getShopNoBuildingCompanyApartment());
        dto.setAreaStreetSectorVillage(address.getAreaStreetSectorVillage());
        dto.setLandmark(address.getLandmark());
        dto.setPincode(address.getPincode());
        dto.setTownCity(address.getTownCity());
        dto.setState(address.getState());

        if (address.getStoreDetails() != null) {
            dto.setStoreId(address.getStoreDetails().getStoreId());
        }

        return dto;
    }

    /**
     * Convert BusinessDetails entity to BusinessDetailsResponseDTO
     */
    public BusinessDetailsResponseDTO toBusinessDetailsResponseDTO(BusinessDetails business) {
        if (business == null) {
            return null;
        }

        BusinessDetailsResponseDTO dto = new BusinessDetailsResponseDTO();
        dto.setBusinessId(business.getBusinessId());
        dto.setBusinessDescription(business.getBusinessDescription());
        dto.setOwnBusiness(business.getOwnBusiness());
        dto.setBusinessSize(business.getBusinessSize());
        dto.setPlatform(business.getPlatform());

        if (business.getStoreDetails() != null) {
            dto.setStoreId(business.getStoreDetails().getStoreId());
        }

        return dto;
    }

    /**
     * Convert Banner entity to BannerResponseDTO
     */
    public BannerResponseDTO toBannerResponseDTO(Banner banner) {
        if (banner == null) {
            return null;
        }

        BannerResponseDTO dto = new BannerResponseDTO();
        dto.setBannerId(banner.getBannerId());
        dto.setImageUrl(banner.getImageUrl());
        dto.setTitle(banner.getTitle());
        dto.setButtonText(banner.getButtonText());
        dto.setButtonLink(banner.getButtonLink());
        dto.setDisplayOrder(banner.getDisplayOrder());
        dto.setIsActive(banner.getIsActive());
        dto.setCreatedAt(banner.getCreatedAt());
        dto.setUpdatedAt(banner.getUpdatedAt());

        if (banner.getSeller() != null) {
            dto.setSellerId(banner.getSeller().getSellerId());
        }

        return dto;
    }

    /**
     * Convert StoreLogo entity to StoreLogoResponseDTO
     */
    public StoreLogoResponseDTO toStoreLogoResponseDTO(StoreLogo logo) {
        if (logo == null) {
            return null;
        }

        StoreLogoResponseDTO dto = new StoreLogoResponseDTO();
        dto.setLogoId(logo.getLogoId());
        dto.setLogoUrl(logo.getLogoUrl());
        dto.setIsActive(logo.getIsActive());
        dto.setUploadedAt(logo.getUploadedAt());

        if (logo.getStore() != null) {
            dto.setStoreId(logo.getStore().getStoreId());
        }

        if (logo.getSeller() != null) {
            dto.setSellerId(logo.getSeller().getSellerId());
        }

        return dto;
    }
}

