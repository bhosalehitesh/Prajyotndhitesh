package com.smartbiz.sakhistore.modules.collection.controller;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    // Simple DTO for returning collections with product counts
    public static class CollectionWithCountDto {
        public Long collectionId;
        public String collectionName;
        public String description;
        public String collectionImage;
        public long productCount;
        public boolean hideFromWebsite;
    }

    // ✅ Get all collections
    @GetMapping("/all")
    public List<collection> getAllCollections() {
        return collectionService.allCollections();
    }

    // ✅ Upload Collection with Images
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadCollectionWithImages(
            @RequestParam("collectionName") String collectionName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "seoTitleTag", required = false) String seoTitleTag,
            @RequestParam(value = "seoMetaDescription", required = false) String seoMetaDescription,
            @RequestParam(value = "collectionImages", required = false) List<MultipartFile> collectionImages,
            @RequestParam(value = "socialSharingImage", required = false) MultipartFile socialSharingImage
    ) {
        try {
            collection col = collectionService.uploadCollectionWithImages(
                    collectionName, description, seoTitleTag, seoMetaDescription, collectionImages, socialSharingImage
            );
            return ResponseEntity.ok(col);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ Add or Edit collection (via JSON)
    @PostMapping("/add")
    public collection addCollection(@RequestBody collection col) {
        return collectionService.addCollection(col);
    }

    // ✅ Get by ID
    @GetMapping("/{id}")
    public collection getById(@PathVariable Long id) {
        return collectionService.findById(id);
    }

    // ✅ Delete collection
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.ok("✅ Collection with ID " + id + " deleted successfully.");
    }

    // ✅ Get all collection names
    @GetMapping("/names")
    public ResponseEntity<List<String>> getAllCollectionNames() {
        return ResponseEntity.ok(collectionService.getAllCollectionNames());
    }

    // ✅ Search by name
    @GetMapping("/search")
    public ResponseEntity<List<collection>> searchCollections(@RequestParam String name) {
        return ResponseEntity.ok(collectionService.searchCollectionsByName(name));
    }

    // ✅ Set products for a collection (many-to-many mapping)
    @PostMapping("/{id}/products")
    public ResponseEntity<collection> setCollectionProducts(
            @PathVariable Long id,
            @RequestBody List<Long> productIds) {
        collection updated = collectionService.setProductsForCollection(id, productIds);
        return ResponseEntity.ok(updated);
    }

    // ✅ Get collections with product counts
    @GetMapping("/with-counts")
    public ResponseEntity<List<CollectionWithCountDto>> getCollectionsWithCounts() {
        List<collection> cols = collectionService.allCollections();
        List<CollectionWithCountDto> result = cols.stream().map(c -> {
            CollectionWithCountDto dto = new CollectionWithCountDto();
            dto.collectionId = c.getCollectionId();
            dto.collectionName = c.getCollectionName();
            dto.description = c.getDescription();
            dto.collectionImage = c.getCollectionImage();
            dto.productCount = collectionService.countProductsForCollection(c.getCollectionId());
             dto.hideFromWebsite = c.isHideFromWebsite();
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ Toggle hide-from-website flag for a collection
    @PutMapping("/{id}/hide-from-website")
    public ResponseEntity<collection> setHideFromWebsite(
            @PathVariable Long id,
            @RequestParam("hide") boolean hide) {
        collection updated = collectionService.updateHideFromWebsite(id, hide);
        return ResponseEntity.ok(updated);
    }
}
