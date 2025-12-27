package com.smartbiz.sakhistore.modules.collection.controller;

import com.smartbiz.sakhistore.modules.collection.dto.*;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.service.CollectionService;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.auth.sellerauth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    
    @Autowired
    private CollectionMapper collectionMapper;
    
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

    // Simple DTO for returning collections with product counts (SmartBiz: same fields as Category)
    public static class CollectionWithCountDto {
        public Long collectionId;
        public String collectionName;
        public String description;
        public String collectionImage;
        public long productCount;
        public boolean hideFromWebsite; // Legacy field
        public Boolean isActive; // SmartBiz: preferred field (same as Category)
        public Integer orderIndex; // SmartBiz: for sorting (same as Category)
        public String slug; // SmartBiz: URL-friendly identifier (same as Category)
    }

    // ✅ Get all collections (filtered by authenticated seller) - Using DTO
    @GetMapping("/all")
    public ResponseEntity<List<CollectionResponseDTO>> getAllCollections(HttpServletRequest httpRequest) {
        Long sellerId = extractSellerIdFromToken(httpRequest);
        List<collection> collections = collectionService.allCollections(sellerId);
        List<CollectionResponseDTO> collectionDTOs = collectionMapper.toCollectionResponseDTOList(collections);
        return ResponseEntity.ok(collectionDTOs);
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

    // ✅ Add or Edit collection (via JSON) - Using DTO
    @PostMapping("/add")
    public ResponseEntity<CollectionResponseDTO> addCollection(
            @Valid @RequestBody CollectionRequestDTO request, 
            HttpServletRequest httpRequest) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        
        Long sellerId = extractSellerIdFromToken(httpRequest);
        
        // Convert DTO to entity
        collection col = new collection();
        col.setCollectionName(request.getCollectionName());
        col.setDescription(request.getDescription());
        col.setCollectionImage(request.getCollectionImage());
        col.setSeoTitleTag(request.getSeoTitleTag());
        col.setSeoMetaDescription(request.getSeoMetaDescription());
        col.setSocialSharingImage(request.getSocialSharingImage());
        col.setIsActive(request.getIsActive());
        col.setOrderIndex(request.getOrderIndex());
        col.setSlug(request.getSlug());
        col.setHideFromWebsite(request.getHideFromWebsite() != null ? request.getHideFromWebsite() : false);
        
        collection savedCollection = collectionService.addCollection(col, sellerId);
        CollectionResponseDTO responseDTO = collectionMapper.toCollectionResponseDTO(savedCollection);
        return ResponseEntity.ok(responseDTO);
    }

    // ✅ Get by ID - Using DTO
    @GetMapping("/{id}")
    public ResponseEntity<CollectionResponseDTO> getById(@PathVariable Long id) {
        collection col = collectionService.findById(id);
        CollectionResponseDTO responseDTO = collectionMapper.toCollectionResponseDTO(col);
        return ResponseEntity.ok(responseDTO);
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

    // ✅ Set products for a collection (many-to-many mapping) - Using DTO
    @PostMapping("/{id}/products")
    public ResponseEntity<CollectionResponseDTO> setCollectionProducts(
            @PathVariable Long id,
            @Valid @RequestBody AddProductsToCollectionRequest request) {
        if (!request.isValid() || !request.getCollectionId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }
        
        collection updated = collectionService.setProductsForCollection(id, request.getProductIds());
        CollectionResponseDTO responseDTO = collectionMapper.toCollectionResponseDTO(updated);
        return ResponseEntity.ok(responseDTO);
    }

    // ✅ Get products for a specific collection
    // Backend: GET /api/collections/{id}/products
    @GetMapping("/{id}/products")
    public ResponseEntity<?> getCollectionProducts(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long sellerId = extractSellerIdFromToken(httpRequest);
            
            // Verify collection exists and belongs to seller
            collection col = collectionService.findById(id);
            if (sellerId != null && col.getSeller() != null && !col.getSeller().getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body("You can only view products of your own collections.");
            }
            
            List<Product> products = collectionService.getProductsByCollectionId(id);
            return ResponseEntity.ok(products);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body("Collection not found with ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching collection products: " + e.getMessage());
        }
    }

    // ✅ Get collections with product counts (filtered by authenticated seller)
    // SmartBiz: Returns all collections (active and hidden) for seller app management
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
            dto.hideFromWebsite = c.isHideFromWebsite(); // Legacy field
            dto.isActive = c.getIsActive(); // SmartBiz: preferred field (same as Category)
            dto.orderIndex = c.getOrderIndex(); // SmartBiz: for sorting (same as Category)
            dto.slug = c.getSlug(); // SmartBiz: URL-friendly identifier (same as Category)
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ Toggle hide-from-website flag for a collection (legacy endpoint)
    @PutMapping("/{id}/hide-from-website")
    public ResponseEntity<collection> setHideFromWebsite(
            @PathVariable Long id,
            @RequestParam("hide") boolean hide) {
        collection updated = collectionService.updateHideFromWebsite(id, hide);
        return ResponseEntity.ok(updated);
    }

    // ✅ Update collection active status (SmartBiz: same as Category)
    @PutMapping("/{id}/status")
    public ResponseEntity<collection> updateCollectionStatus(
            @PathVariable Long id,
            @RequestParam("isActive") boolean isActive) {
        collection col = collectionService.findById(id);
        col.setIsActive(isActive);
        return ResponseEntity.ok(collectionService.addCollection(col, null));
    }

    // ✅ Update collection (SmartBiz: supports isActive, slug, orderIndex - same as Category)
    @PutMapping("/{id}")
    public ResponseEntity<collection> updateCollection(
            @PathVariable Long id,
            @RequestBody collection updatedCollection) {
        try {
            collection existing = collectionService.findById(id);
            
            // Update fields (SmartBiz: same as Category update logic)
            if (updatedCollection.getCollectionName() != null) {
                existing.setCollectionName(updatedCollection.getCollectionName());
                // Regenerate slug if name changed
                if (updatedCollection.getSlug() == null || updatedCollection.getSlug().isEmpty()) {
                    String newSlug = collectionService.generateUniqueSlug(updatedCollection.getCollectionName(), 
                        existing.getSeller() != null ? existing.getSeller().getSellerId() : null);
                    existing.setSlug(newSlug);
                }
            }
            if (updatedCollection.getDescription() != null) {
                existing.setDescription(updatedCollection.getDescription());
            }
            if (updatedCollection.getCollectionImage() != null) {
                existing.setCollectionImage(updatedCollection.getCollectionImage());
            }
            if (updatedCollection.getSeoTitleTag() != null) {
                existing.setSeoTitleTag(updatedCollection.getSeoTitleTag());
            }
            if (updatedCollection.getSeoMetaDescription() != null) {
                existing.setSeoMetaDescription(updatedCollection.getSeoMetaDescription());
            }
            if (updatedCollection.getSocialSharingImage() != null) {
                existing.setSocialSharingImage(updatedCollection.getSocialSharingImage());
            }
            if (updatedCollection.getIsActive() != null) {
                existing.setIsActive(updatedCollection.getIsActive());
            }
            if (updatedCollection.getOrderIndex() != null) {
                existing.setOrderIndex(updatedCollection.getOrderIndex());
            }
            if (updatedCollection.getSlug() != null && !updatedCollection.getSlug().isEmpty()) {
                existing.setSlug(updatedCollection.getSlug());
            }
            
            Long sellerId = existing.getSeller() != null ? existing.getSeller().getSellerId() : null;
            return ResponseEntity.ok(collectionService.addCollection(existing, sellerId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ Add a single product to an existing collection (from Products screen)
    @PostMapping("/{id}/add-product")
    public ResponseEntity<collection> addProductToCollection(
            @PathVariable Long id,
            @RequestParam("productId") Long productId) {
        collection updated = collectionService.addProductToCollection(id, productId);
        return ResponseEntity.ok(updated);
    }
}
