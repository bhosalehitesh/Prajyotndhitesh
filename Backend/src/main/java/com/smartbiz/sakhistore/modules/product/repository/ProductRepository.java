package com.smartbiz.sakhistore.modules.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.product.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // All products for a specific seller
    List<Product> findBySeller_SellerId(Long sellerId);

    // Count products in a specific collection
    long countByCollections_CollectionId(Long collectionId);

    // Get distinct product categories
    @Query("SELECT DISTINCT p.productCategory FROM Product p WHERE p.productCategory IS NOT NULL")
    List<String> findAllDistinctProductCategories();

    //Search products by name (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByProductNameContainingIgnoreCase(@Param("name") String name);


    Product findByCustomSku(String customSku);
}

