package com.smartbiz.sakhistore.modules.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Find all variants for a product
    List<ProductVariant> findByProduct_ProductsId(Long productId);

    // Find active variants for a product
    List<ProductVariant> findByProduct_ProductsIdAndIsActiveTrue(Long productId);

    // Find variant by SKU (for a specific seller)
    Optional<ProductVariant> findBySku(String sku);

    // Find variants in stock for a product
    @Query("SELECT v FROM ProductVariant v WHERE v.product.productsId = :productId AND v.stock > 0 AND v.isActive = true")
    List<ProductVariant> findInStockVariantsByProductId(@Param("productId") Long productId);

    // Check if product has any active variants
    @Query("SELECT COUNT(v) > 0 FROM ProductVariant v WHERE v.product.productsId = :productId AND v.isActive = true")
    boolean hasActiveVariants(@Param("productId") Long productId);

    // Find variant by product and attributes (for duplicate checking)
    @Query("SELECT v FROM ProductVariant v WHERE v.product.productsId = :productId AND v.attributesJson = :attributesJson")
    Optional<ProductVariant> findByProductAndAttributes(@Param("productId") Long productId, @Param("attributesJson") String attributesJson);

    // Count variants for a product
    long countByProduct_ProductsId(Long productId);

    // Find variants by product with stock > 0
    List<ProductVariant> findByProduct_ProductsIdAndStockGreaterThan(Long productId, Integer stock);
    
    // Fetch variants for multiple products (called separately to avoid cartesian product)
    @Query("SELECT v FROM ProductVariant v " +
           "WHERE v.product.productsId IN :productIds " +
           "AND v.isActive = true " +
           "ORDER BY v.product.productsId, v.variantId")
    List<ProductVariant> findVariantsByProductIds(@Param("productIds") List<Long> productIds);
}
