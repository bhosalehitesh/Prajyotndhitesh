package com.smartbiz.sakhistore.modules.collection.dto;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility to convert Collection entities to DTOs
 */
@Component
public class CollectionMapper {

    /**
     * Convert collection entity to CollectionResponseDTO
     */
    public CollectionResponseDTO toCollectionResponseDTO(collection col) {
        if (col == null) {
            return null;
        }

        CollectionResponseDTO dto = new CollectionResponseDTO();
        dto.setCollectionId(col.getCollectionId());
        dto.setCollectionName(col.getCollectionName());
        dto.setDescription(col.getDescription());
        dto.setCollectionImage(col.getCollectionImage());
        dto.setSeoTitleTag(col.getSeoTitleTag());
        dto.setSeoMetaDescription(col.getSeoMetaDescription());
        dto.setSocialSharingImage(col.getSocialSharingImage());
        dto.setIsActive(col.getIsActive());
        dto.setOrderIndex(col.getOrderIndex());
        dto.setSlug(col.getSlug());
        dto.setHideFromWebsite(col.isHideFromWebsite());

        // Seller information
        if (col.getSeller() != null) {
            dto.setSellerId(col.getSeller().getSellerId());
        }

        // Product count (if products are loaded)
        if (col.getProducts() != null) {
            dto.setProductCount((long) col.getProducts().size());
        }

        return dto;
    }

    /**
     * Convert list of collections to list of CollectionResponseDTO
     */
    public List<CollectionResponseDTO> toCollectionResponseDTOList(List<collection> collections) {
        if (collections == null) {
            return List.of();
        }
        return collections.stream()
                .map(this::toCollectionResponseDTO)
                .collect(Collectors.toList());
    }
}

