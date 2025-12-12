package com.smartbiz.sakhistore.modules.cart.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbiz.sakhistore.modules.cart.model.WishlistItem;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import com.smartbiz.sakhistore.modules.product.model.Product;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUser(User user);

    boolean existsByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);
}
