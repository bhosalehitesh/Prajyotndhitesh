package com.smartbiz.sakhistore.modules.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.product.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Optional: custom finder methods if needed later
    // List<Product> findBySellerId(Long sellerId);
    // List<Product> findByBusinessCategory(String category);

    // Get distinct product categories
    @Query("SELECT DISTINCT p.productCategory FROM Product p WHERE p.productCategory IS NOT NULL")
    List<String> findAllDistinctProductCategories();

    //Search products by name (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByProductNameContainingIgnoreCase(@Param("name") String name);


    Product findByCustomSku(String customSku);
}

