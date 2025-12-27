package com.smartbiz.sakhistore.modules.category.dto;

import com.smartbiz.sakhistore.modules.category.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility to convert Category entities to DTOs
 */
@Component
public class CategoryMapper {

    /**
     * Convert Category entity to CategoryResponseDTO
     */
    public CategoryResponseDTO toCategoryResponseDTO(Category category) {
        if (category == null) {
            return null;
        }

        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setBusinessCategory(category.getBusinessCategory());
        dto.setDescription(category.getDescription());
        dto.setCategoryImage(category.getCategoryImage());
        dto.setSeoTitleTag(category.getSeoTitleTag());
        dto.setSeoMetaDescription(category.getSeoMetaDescription());
        dto.setSocialSharingImage(category.getSocialSharingImage());
        dto.setIsActive(category.getIsActive());
        dto.setIsTrending(category.getIsTrending());
        dto.setOrderIndex(category.getOrderIndex());
        dto.setSlug(category.getSlug());

        // Seller information
        if (category.getSeller() != null) {
            dto.setSellerId(category.getSeller().getSellerId());
        }

        // Product count (if products are loaded)
        if (category.getProducts() != null) {
            dto.setProductCount((long) category.getProducts().size());
        }

        return dto;
    }

    /**
     * Convert list of Categories to list of CategoryResponseDTO
     */
    public List<CategoryResponseDTO> toCategoryResponseDTOList(List<Category> categories) {
        if (categories == null) {
            return List.of();
        }
        return categories.stream()
                .map(this::toCategoryResponseDTO)
                .collect(Collectors.toList());
    }
}

