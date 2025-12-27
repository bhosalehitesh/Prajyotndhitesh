package com.smartbiz.sakhistore.modules.cart.repository;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.customer_user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    // Eagerly fetch cart with all items, products, variants, and sellers to avoid
    // lazy loading issues
    @Query("SELECT DISTINCT c FROM Cart c " +
            "LEFT JOIN FETCH c.items i " +
            "LEFT JOIN FETCH i.product p " +
            "LEFT JOIN FETCH i.variant v " +
            "LEFT JOIN FETCH v.product vp " +
            "LEFT JOIN FETCH p.seller ps " +
            "LEFT JOIN FETCH vp.seller vs " +
            "WHERE c.user = :user")
    Optional<Cart> findByUserWithItemsAndProducts(@Param("user") User user);

}
