package com.smartbiz.sakhistore.modules.collection.repository;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CollectionRepository extends JpaRepository<collection, Long> {

    // Find by collection name (for search)
    List<collection> findByCollectionNameContainingIgnoreCase(String name);

    // Get distinct collection names
    @Query("SELECT DISTINCT c.collectionName FROM collection c")
    List<String> findAllDistinctCollectionNames();
}
