package com.smartbiz.sakhistore.modules.collection.repository;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CollectionRepository extends JpaRepository<collection, Long> {

    // Find by collection name (for search)
    List<collection> findByCollectionNameContainingIgnoreCase(String name);
    
    // Filter by seller
    List<collection> findBySeller_SellerId(Long sellerId);
    List<collection> findBySeller_SellerIdAndCollectionNameContainingIgnoreCase(Long sellerId, String name);

    // Get distinct collection names for a seller
    @Query("SELECT DISTINCT c.collectionName FROM collection c WHERE c.seller.sellerId = :sellerId")
    List<String> findAllDistinctCollectionNamesBySeller(@Param("sellerId") Long sellerId);
    
    // Get distinct collection names (all - for backward compatibility, but should be filtered)
    @Query("SELECT DISTINCT c.collectionName FROM collection c")
    List<String> findAllDistinctCollectionNames();
    
    // Delete all entries from join table for a specific collection
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM collection_products WHERE collection_id = :collectionId", nativeQuery = true)
    void deleteCollectionProducts(@Param("collectionId") Long collectionId);
    
    // =======================
    // SLUG-BASED QUERIES (SmartBiz: same as Category)
    // =======================
    // Find by slug and seller ID (for public store API)
    collection findBySlugAndSeller_SellerId(String slug, Long sellerId);
    
    // Find by slug (for global slug checks - use with caution)
    collection findBySlug(String slug);
}
