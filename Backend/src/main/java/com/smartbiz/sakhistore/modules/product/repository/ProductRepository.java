package com.smartbiz.sakhistore.modules.product.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.product.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // All products for a specific seller
    List<Product> findBySeller_SellerId(Long sellerId);
    
    // Paginated products for a specific seller
    Page<Product> findBySeller_SellerId(Long sellerId, Pageable pageable);
    
    // Optimized query with JOIN FETCH to avoid N+1 queries
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.seller " +
           "LEFT JOIN FETCH p.category " +
           "WHERE p.seller.sellerId = :sellerId " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findBySeller_SellerIdWithRelations(@Param("sellerId") Long sellerId, Pageable pageable);

    // Find products by seller and active status with relations
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.seller " +
           "LEFT JOIN FETCH p.category " +
           "WHERE p.seller.sellerId = :sellerId AND p.isActive = :isActive " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findBySeller_SellerIdAndIsActiveWithRelations(
            @Param("sellerId") Long sellerId, 
            @Param("isActive") Boolean isActive, 
            Pageable pageable);

    // Find products by active status
    Page<Product> findByIsActive(Boolean isActive, Pageable pageable);

    // Find products by seller and active status
    List<Product> findBySeller_SellerIdAndIsActive(Long sellerId, Boolean isActive);

    // Count products in a specific collection
    long countByCollections_CollectionId(Long collectionId);
    
    // Find all products in a specific collection
    @Query("SELECT p FROM Product p JOIN p.collections c WHERE c.collectionId = :collectionId")
    List<Product> findByCollections_CollectionId(@Param("collectionId") Long collectionId);

    // Get distinct product categories
    @Query("SELECT DISTINCT p.productCategory FROM Product p WHERE p.productCategory IS NOT NULL")
    List<String> findAllDistinctProductCategories();

    //Search products by name (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByProductNameContainingIgnoreCase(@Param("name") String name);


    Product findByCustomSku(String customSku);
    
    

}