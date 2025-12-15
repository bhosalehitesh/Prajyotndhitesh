package com.smartbiz.sakhistore.modules.store.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartbiz.sakhistore.config.CloudinaryHelper;
import com.smartbiz.sakhistore.modules.auth.sellerauth.model.SellerDetails;
import com.smartbiz.sakhistore.modules.auth.sellerauth.repository.SellerDetailsRepo;
import com.smartbiz.sakhistore.modules.store.model.Banner;
import com.smartbiz.sakhistore.modules.store.repository.BannerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private SellerDetailsRepo sellerRepository;

    @Autowired
    private CloudinaryHelper cloudinaryHelper;

    // Get all banners for a seller
    public List<Banner> getBannersBySellerId(Long sellerId) {
        return bannerRepository.findBySeller_SellerId(sellerId);
    }

    // Get active banners for a seller (ordered by display order)
    public List<Banner> getActiveBannersBySellerId(Long sellerId) {
        return bannerRepository.findActiveBannersBySellerId(sellerId);
    }

    // Get a specific banner by ID
    public Banner getBannerById(Long bannerId, Long sellerId) {
        return bannerRepository.findByBannerIdAndSeller_SellerId(bannerId, sellerId)
                .orElseThrow(() -> new NoSuchElementException("Banner not found with ID: " + bannerId));
    }

    // Create a new banner
    public Banner createBanner(Long sellerId, String imageUrl, String title, String buttonText, String buttonLink, Integer displayOrder) {
        SellerDetails seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new NoSuchElementException("Seller not found with ID: " + sellerId));

        ensureSellerHasCapacity(sellerId);

        Banner banner = new Banner(seller, imageUrl, title, buttonText, buttonLink, displayOrder);
        return bannerRepository.save(banner);
    }

    // Upload banner image and create banner
    public Banner uploadBannerImageAndCreate(Long sellerId, MultipartFile imageFile, String title, String buttonText, String buttonLink, Integer displayOrder) {
        try {
            // Prevent needless uploads if seller is already at the limit
            ensureSellerHasCapacity(sellerId);

            // Upload image to Cloudinary
            String imageUrl = cloudinaryHelper.saveImage(imageFile, "banners");
            
            // Create banner with uploaded image URL
            return createBanner(sellerId, imageUrl, title, buttonText, buttonLink, displayOrder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload banner image: " + e.getMessage(), e);
        }
    }

    // Update banner
    public Banner updateBanner(Long bannerId, Long sellerId, String imageUrl, String title, String buttonText, String buttonLink, Integer displayOrder, Boolean isActive) {
        Banner banner = getBannerById(bannerId, sellerId);
        
        if (imageUrl != null) {
            banner.setImageUrl(imageUrl);
        }
        if (title != null) {
            banner.setTitle(title);
        }
        if (buttonText != null) {
            banner.setButtonText(buttonText);
        }
        if (buttonLink != null) {
            banner.setButtonLink(buttonLink);
        }
        if (displayOrder != null) {
            banner.setDisplayOrder(displayOrder);
        }
        if (isActive != null) {
            banner.setIsActive(isActive);
        }
        
        return bannerRepository.save(banner);
    }

    // Upload new banner image and update banner
    public Banner uploadBannerImageAndUpdate(Long bannerId, Long sellerId, MultipartFile imageFile) {
        try {
            Banner banner = getBannerById(bannerId, sellerId);
            
            // Upload new image to Cloudinary
            String imageUrl = cloudinaryHelper.saveImage(imageFile, "banners");
            
            // Update banner with new image URL
            banner.setImageUrl(imageUrl);
            return bannerRepository.save(banner);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload banner image: " + e.getMessage(), e);
        }
    }

    // Delete banner
    public void deleteBanner(Long bannerId, Long sellerId) {
        Banner banner = getBannerById(bannerId, sellerId);
        bannerRepository.delete(banner);
    }

    // Guardrail: max 3 banners per seller
    private void ensureSellerHasCapacity(Long sellerId) {
        long count = bannerRepository.countBySeller_SellerId(sellerId);
        if (count >= 3) {
            throw new IllegalStateException("You can only have up to 3 banners. Please delete an existing banner first.");
        }
    }

    // Toggle banner active status
    public Banner toggleBannerStatus(Long bannerId, Long sellerId) {
        Banner banner = getBannerById(bannerId, sellerId);
        banner.setIsActive(!banner.getIsActive());
        return bannerRepository.save(banner);
    }
}
