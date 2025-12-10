package com.smartbiz.sakhistore.modules.collection.controller;

import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.service.CollectionService;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    @Autowired
    private CollectionService collectionService;
    
    @Autowired
    private JwtService jwtService;
    
    // Helper method to extract sellerId from JWT token
    private Long extractSellerIdFromToken(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            // If token extraction fails, return null (will return all collections for backward compatibility)
        }
        return null;
    }

    // Simple DTO for returning collections with product counts
    public static class CollectionWithCountDto {
        public Long collectionId;
        public String collectionName;
        public String description;
        public String collectionImage;
        public long productCount;
        public boolean hideFromWebsite;
    }

    // ✅ Get all collections (filtered by authenticated seller)
    @GetMapping("/all")
    public List<collection> getAllCollections(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return collectionService.allCollections(sellerId);
    }

    // ✅ Upload Collection with Images
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadCollectionWithImages(
            @RequestParam("collectionName") String collectionName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "seoTitleTag", required = false) String seoTitleTag,
            @RequestParam(value = "seoMetaDescription", required = false) String seoMetaDescription,
            @RequestParam(value = "collectionImages", required = false) List<MultipartFile> collectionImages,
            @RequestParam(value = "socialSharingImage", required = false) MultipartFile socialSharingImage,
            HttpServletRequest httpRequest
    ) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
            }
            
            collection col = collectionService.uploadCollectionWithImages(
                    collectionName, description, seoTitleTag, seoMetaDescription, collectionImages, socialSharingImage, sellerId
            );
            return ResponseEntity.ok(col);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ Add or Edit collection (via JSON)
    @PostMapping("/add")
    public collection addCollection(@RequestBody collection col, HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return collectionService.addCollection(col, sellerId);
    }

    // ✅ Get by ID
    @GetMapping("/{id}")
    public collection getById(@PathVariable Long id) {
        return collectionService.findById(id);
    }

    // ✅ Delete collection (with seller verification)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            if (sellerId == null) {
                return ResponseEntity.status(401).body("Authentication required. Please provide a valid JWT token.");
            }
            
            // Verify collection belongs to seller
            collection col = collectionService.findById(id);
            if (col.getSeller() == null || !col.getSeller().getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body("You can only delete your own collections.");
            }
            
            System.out.println("========== DELETE COLLECTION REQUEST ==========");
            System.out.println("Collection ID: " + id);
            collectionService.deleteCollection(id);
            System.out.println("Collection deleted successfully");
            System.out.println("================================================");
            return ResponseEntity.ok("✅ Collection with ID " + id + " deleted successfully.");
        } catch (NoSuchElementException e) {
            System.err.println("Collection not found: " + id);
            return ResponseEntity.status(404).body("Collection not found with ID: " + id);
        } catch (Exception e) {
            System.err.println("========== CONTROLLER ERROR ==========");
            System.err.println("Error deleting collection " + id + ": " + e.getMessage());
            e.printStackTrace();
            System.err.println("======================================");
            return ResponseEntity.status(500).body("Failed to delete collection: " + e.getMessage());
        }
    }

    // ✅ Get all collection names (filtered by authenticated seller)
    @GetMapping("/names")
    public ResponseEntity<List<String>> getAllCollectionNames(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return ResponseEntity.ok(collectionService.getAllCollectionNames(sellerId));
    }

    // ✅ Search by name (filtered by authenticated seller)
    @GetMapping("/search")
    public ResponseEntity<List<collection>> searchCollections(
            @RequestParam String name,
            HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        return ResponseEntity.ok(collectionService.searchCollectionsByName(name, sellerId));
    }

    // ✅ Set products for a collection (many-to-many mapping)
    @PostMapping("/{id}/products")
    public ResponseEntity<collection> setCollectionProducts(
            @PathVariable Long id,
            @RequestBody List<Long> productIds) {
        collection updated = collectionService.setProductsForCollection(id, productIds);
        return ResponseEntity.ok(updated);
    }

    // ✅ Get collections with product counts (filtered by authenticated seller)
    @GetMapping("/with-counts")
    public ResponseEntity<List<CollectionWithCountDto>> getCollectionsWithCounts(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<collection> cols = collectionService.allCollections(sellerId);
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

    // ✅ Add a single product to an existing collection (from Products screen)
    @PostMapping("/{id}/add-product")
    public ResponseEntity<collection> addProductToCollection(
            @PathVariable Long id,
            @RequestParam("productId") Long productId) {
        collection updated = collectionService.addProductToCollection(id, productId);
        return ResponseEntity.ok(updated);
    }

    // ✅ Get products for a specific collection
    @GetMapping("/{id}/products")
    public ResponseEntity<?> getProductsByCollection(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(collectionService.getProductsByCollection(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("Collection not found with ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to load collection products: " + e.getMessage());
        }
    }
}
