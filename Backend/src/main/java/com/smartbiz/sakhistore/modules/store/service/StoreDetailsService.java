package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import com.smartbiz.sakhistore.modules.category.model.Category;
import com.smartbiz.sakhistore.modules.category.repository.CategoryRepository;
import com.smartbiz.sakhistore.modules.collection.model.collection;
import com.smartbiz.sakhistore.modules.collection.repository.CollectionRepository;
import com.smartbiz.sakhistore.modules.store.model.StoreAddress;
import com.smartbiz.sakhistore.modules.store.model.StoreDetails;
import com.smartbiz.sakhistore.modules.store.model.StoreLogo;
import com.smartbiz.sakhistore.modules.store.repository.StoreAddressRepo;
import com.smartbiz.sakhistore.modules.store.repository.StoreDetailsRepo;
import com.smartbiz.sakhistore.modules.store.repository.StoreLogoRepo;

import lombok.RequiredArgsConstructor;



@Service

@RequiredArgsConstructor

@Transactional

public class StoreDetailsService {

    @Value("${app.store.domain}")
    private String domain;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
   CollectionRepository collectionRepository;
    
    @Autowired
    private StoreDetailsRepo storeRepository;

    @Autowired
    private CloudinaryHelper cloudinaryHelper;

    @Autowired
    private SellerDetailsRepo sellerRepository;

    @Autowired
    private StoreLogoRepo storeLogoRepo;

    @Autowired
    private StoreAddressRepo storeAddressRepo;



    // ✅ Get all stores (filtered by seller)
    public List<StoreDetails> allStores(Long sellerId) {
        if (sellerId != null) {
            return storeRepository.findBySeller_SellerId(sellerId);
        }
        return storeRepository.findAll();
    }
    
    // ✅ Get all stores (backward compatibility - returns all, should be avoided)
    public List<StoreDetails> allStores() {
        return storeRepository.findAll();
    }



    // ✅ Add or update store




    // ✅ Find store by ID

    public StoreDetails findByIdDS(Long storeId) {

        return storeRepository.findById(storeId)

                .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));

    }



    // ✅ Find store by Seller ID (assumes one store per seller)
    public StoreDetails findBySellerId(Long sellerId) {
        List<StoreDetails> stores = storeRepository.findBySeller_SellerId(sellerId);
        if (stores.isEmpty()) {
            throw new NoSuchElementException("Store not found for sellerId: " + sellerId);
        }
        StoreDetails store = stores.get(0);
        // Ensure relationships are loaded by fetching with relations
        if (store.getStoreId() != null) {
            Optional<StoreDetails> storeWithRelations = storeRepository.findByIdWithRelations(store.getStoreId());
            if (storeWithRelations.isPresent()) {
                return storeWithRelations.get();
            }
        }
        return store;
    }
    
    // ✅ Find store by slug (extracted from storeLink)
    public StoreDetails findBySlug(String slug) {
        // Normalize the input slug (lowercase, remove special chars)
        String normalizedSlug = slug.toLowerCase().trim();
        System.out.println("🔍 [findBySlug] Looking for slug: '" + normalizedSlug + "' (original: '" + slug + "')");
        
        // Get all stores WITH relationships loaded (JOIN FETCH) and find the one whose storeLink contains the slug
        // StoreLink format: domain/slug or domain/slug/
        List<StoreDetails> allStores = storeRepository.findAllWithRelations();
        System.out.println("📦 [findBySlug] Total stores in database: " + allStores.size());
        
        for (StoreDetails store : allStores) {
            String storeLink = store.getStoreLink();
            if (storeLink != null) {
                // Extract slug from storeLink (everything after the last /)
                String linkSlug = storeLink.substring(storeLink.lastIndexOf('/') + 1);
                // Remove trailing slash if present
                linkSlug = linkSlug.replaceAll("/$", "").toLowerCase();
                
                System.out.println("  🔎 [findBySlug] Checking store: " + store.getStoreName() + 
                    " | storeLink: '" + storeLink + "' | extracted slug: '" + linkSlug + "'");
                
                // Try exact match first
                if (linkSlug.equals(normalizedSlug)) {
                    System.out.println("  ✅ [findBySlug] EXACT MATCH found: " + store.getStoreName());
                    return store;
                }
                
                // Try match by removing hyphens (hitesh-bhosale matches hiteshbhosale)
                String linkSlugNoHyphen = linkSlug.replaceAll("-", "");
                String normalizedSlugNoHyphen = normalizedSlug.replaceAll("-", "");
                if (linkSlugNoHyphen.equals(normalizedSlugNoHyphen)) {
                    System.out.println("  ✅ [findBySlug] NO-HYPHEN MATCH found: " + store.getStoreName());
                    return store;
                }
                
                // Try match by removing all non-alphanumeric (case-insensitive)
                String linkSlugClean = linkSlug.replaceAll("[^a-z0-9]", "");
                String normalizedSlugClean = normalizedSlug.replaceAll("[^a-z0-9]", "");
                if (linkSlugClean.equals(normalizedSlugClean) && !linkSlugClean.isEmpty()) {
                    System.out.println("  ✅ [findBySlug] CLEAN MATCH found: " + store.getStoreName());
                    return store;
                }
            } else {
                System.out.println("  ⚠️ [findBySlug] Store '" + store.getStoreName() + "' has NULL storeLink");
            }
        }
        
        System.out.println("❌ [findBySlug] Store not found with slug: '" + normalizedSlug + "'");
        throw new NoSuchElementException("Store not found with slug: " + slug);
    }

    // ✅ Delete store
    public void deleteStore(Long storeId) {

        StoreDetails store = storeRepository.findById(storeId)

                .orElseThrow(() -> new NoSuchElementException("Store not found with ID: " + storeId));

        storeRepository.delete(store);

    }

    //for link this logic

    // ---------------------- CREATE ----------------------
    public StoreDetails addStore(StoreDetails store, Long sellerId) {
        // ✅ VALIDATION: Seller ID is required
        if (sellerId == null) {
            throw new RuntimeException("Seller ID is required! Cannot create store without linking to a seller.");
        }

        // ✅ VALIDATION: Check if seller exists
        SellerDetails seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with ID: " + sellerId + ". Please create seller first."));

        // ✅ VALIDATION: Check if seller already has a store
        try {
            findBySellerId(sellerId);
            throw new RuntimeException("Seller already has a store! One seller can only have one store.");
        } catch (NoSuchElementException e) {
            // Seller doesn't have a store yet - this is good, continue
        }

        // Check unique store name
        if (storeRepository.existsByStoreName(store.getStoreName())) {
            throw new RuntimeException("Store name already exists! Please choose a unique store name.");
        }

        // Generate slug
        String slug = store.getStoreName()
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9\\-]", "");

        // Set the unique store link
        store.setStoreLink(domain + "/" + slug);

        // ✅ CRITICAL: Link store to seller (prevents null seller_id)
        store.setSeller(seller);

        // ✅ CRITICAL: Temporarily remove address from store before saving
        // We need to save store first to get storeId, then link address
        StoreAddress addressToLink = store.getStoreAddress();
        store.setStoreAddress(null); // Temporarily remove to avoid null store_id
        
        // ✅ Save store first to get storeId
        StoreDetails savedStore = storeRepository.save(store);

        // ✅ CRITICAL: Handle store address if provided
        // Address must be linked AFTER store is saved (so store has an ID)
        if (addressToLink != null) {
            // Set the saved store as the owner of the address
            addressToLink.setStoreDetails(savedStore);
            
            // Check if store already has an address (one-to-one relationship)
            java.util.Optional<StoreAddress> existingAddress = storeAddressRepo.findByStoreDetails_StoreId(savedStore.getStoreId());
            
            if (existingAddress.isPresent()) {
                // Update existing address
                StoreAddress existing = existingAddress.get();
                existing.setShopNoBuildingCompanyApartment(addressToLink.getShopNoBuildingCompanyApartment());
                existing.setAreaStreetSectorVillage(addressToLink.getAreaStreetSectorVillage());
                existing.setLandmark(addressToLink.getLandmark());
                existing.setPincode(addressToLink.getPincode());
                existing.setTownCity(addressToLink.getTownCity());
                existing.setState(addressToLink.getState());
                existing.setStoreDetails(savedStore); // Ensure relationship is set
                storeAddressRepo.save(existing);
                savedStore.setStoreAddress(existing);
            } else {
                // Save address directly via repository to ensure store_id is set
                StoreAddress savedAddress = storeAddressRepo.save(addressToLink);
                // Set address back on store for bidirectional relationship
                savedStore.setStoreAddress(savedAddress);
            }
            
            // Refresh store to ensure address is loaded
            savedStore = storeRepository.findByIdWithRelations(savedStore.getStoreId())
                    .orElse(savedStore);
        }

        return savedStore;
    }

    // ---------------------- UPDATE ----------------------
    public StoreDetails updateStore(Long id, StoreDetails updated) {

        return storeRepository.findById(id).map(store -> {

            // If store name changed → check uniqueness
            if (!store.getStoreName().equals(updated.getStoreName())) {

                if (storeRepository.existsByStoreName(updated.getStoreName())) {
                    throw new RuntimeException("Store name already exists! Choose a different name.");
                }
            }

            store.setStoreName(updated.getStoreName());

            // Regenerate slug
            String slug = updated.getStoreName()
                    .toLowerCase()
                    .trim()
                    .replaceAll("\\s+", "-")
                    .replaceAll("[^a-z0-9\\-]", "");

            store.setStoreLink(domain + "/" + slug);

            return storeRepository.save(store);

        }).orElseThrow(() -> new RuntimeException("Store not found"));
    }

    // Check if store name is available
    public boolean isStoreNameAvailable(String storeName) {
        if (storeName == null || storeName.trim().isEmpty()) {
            return false;
        }
        return !storeRepository.existsByStoreName(storeName.trim());
    }

    // Upload logo for a store
    public StoreDetails uploadLogo(Long storeId, MultipartFile logoFile) {
        StoreDetails store = findByIdDS(storeId);
        SellerDetails seller = store.getSeller();
        
        // Upload logo to Cloudinary
        String logoUrl = cloudinaryHelper.saveImage(logoFile);
        
        if (logoUrl == null) {
            throw new RuntimeException("Failed to upload logo. Please try again.");
        }
        
        // Deactivate all previous logos for this store
        List<StoreLogo> existingLogos = storeLogoRepo.findByStore_StoreId(storeId);
        for (StoreLogo existingLogo : existingLogos) {
            existingLogo.setIsActive(false);
            storeLogoRepo.save(existingLogo);
        }
        
        // Create new logo entry in store_logos table
        StoreLogo storeLogo = new StoreLogo();
        storeLogo.setStore(store);
        storeLogo.setSeller(seller);
        storeLogo.setLogoUrl(logoUrl);
        storeLogo.setIsActive(true);
        storeLogoRepo.save(storeLogo);
        
        // Also save logo URL to store_details table for backward compatibility
        store.setLogoUrl(logoUrl);
        return storeRepository.save(store);
    }

    // Upload logo for a store by seller ID
    public StoreDetails uploadLogoBySellerId(Long sellerId, MultipartFile logoFile) {
        StoreDetails store = findBySellerId(sellerId);
        SellerDetails seller = store.getSeller();
        
        // Upload logo to Cloudinary
        String logoUrl = cloudinaryHelper.saveImage(logoFile);
        
        if (logoUrl == null) {
            throw new RuntimeException("Failed to upload logo. Please try again.");
        }
        
        // Deactivate all previous logos for this store
        List<StoreLogo> existingLogos = storeLogoRepo.findByStore_StoreId(store.getStoreId());
        for (StoreLogo existingLogo : existingLogos) {
            existingLogo.setIsActive(false);
            storeLogoRepo.save(existingLogo);
        }
        
        // Create new logo entry in store_logos table
        StoreLogo storeLogo = new StoreLogo();
        storeLogo.setStore(store);
        storeLogo.setSeller(seller);
        storeLogo.setLogoUrl(logoUrl);
        storeLogo.setIsActive(true);
        StoreLogo savedLogo = storeLogoRepo.save(storeLogo);
        
        System.out.println("✅ Logo saved to store_logos table - LogoId: " + savedLogo.getLogoId() + 
                          ", StoreId: " + store.getStoreId() + 
                          ", SellerId: " + sellerId + 
                          ", LogoUrl: " + logoUrl);
        
        // Also save logo URL to store_details table for backward compatibility
        store.setLogoUrl(logoUrl);
        StoreDetails savedStore = storeRepository.save(store);
        
        System.out.println("✅ Logo also saved to store_details table - StoreId: " + savedStore.getStoreId());
        
        return savedStore;
    }

    // Get active logo for a store by seller ID
    public StoreLogo getActiveLogoBySellerId(Long sellerId) {
        return storeLogoRepo.findBySeller_SellerIdAndIsActiveTrue(sellerId)
                .orElse(null);
    }

   
    public List<Category> getCategoriesByStoreName(String storeName) {

        StoreDetails store = storeRepository.findByStoreName(storeName)
                .orElseThrow(() -> new NoSuchElementException("Store not found: " + storeName));

        if (store.getSeller() == null || store.getSeller().getSellerId() == null) {
            throw new NoSuchElementException("Store has no seller assigned.");
        }

        Long sellerId = store.getSeller().getSellerId();

        return categoryRepository.findBySeller_SellerId(sellerId);
    }
    

public List<collection> getCollectionsByStoreName(String storeName) {

    StoreDetails store = storeRepository.findByStoreName(storeName)
            .orElseThrow(() -> new NoSuchElementException("Store not found"));

    if (store.getSeller() == null || store.getSeller().getSellerId() == null) {
        throw new NoSuchElementException("Store has no seller assigned.");
    }

    Long sellerId = store.getSeller().getSellerId();

    return collectionRepository.findBySeller_SellerId(sellerId);
}




	



}