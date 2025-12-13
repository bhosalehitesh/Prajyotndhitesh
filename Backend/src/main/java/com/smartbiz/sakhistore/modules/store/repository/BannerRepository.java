package com.smartbiz.sakhistore.modules.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.store.model.Banner;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    // Find all banners for a specific seller
    List<Banner> findBySeller_SellerId(Long sellerId);

    // Find active banners for a specific seller, ordered by display order
    @Query("SELECT b FROM Banner b WHERE b.seller.sellerId = :sellerId AND b.isActive = true ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<Banner> findActiveBannersBySellerId(@Param("sellerId") Long sellerId);

    // Find a specific banner by ID and seller ID
    Optional<Banner> findByBannerIdAndSeller_SellerId(Long bannerId, Long sellerId);

    // Count banners for a seller
    long countBySeller_SellerId(Long sellerId);
}
