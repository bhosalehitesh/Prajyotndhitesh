package com.smartbiz.sakhistore.modules.category.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartbiz.sakhistore.modules.category.model.Category;
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByBusinessCategoryContainingIgnoreCase(String businessCategory);

    List<Category> findByCategoryNameIgnoreCase(String categoryName);

    // Filter by sellerId — CORRECT
    List<Category> findBySeller_SellerId(Long sellerId);

    List<Category> findBySeller_SellerIdAndBusinessCategoryContainingIgnoreCase(
            Long sellerId, String businessCategory);

    // Find category by slug (for seller)
    Category findBySlugAndSeller_SellerId(String slug, Long sellerId);

    // Find category by slug (any seller - use with caution)
    Category findBySlug(String slug);
}

