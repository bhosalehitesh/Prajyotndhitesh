package com.smartbiz.sakhistore.modules.order.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.customer_user.model.User;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {

       List<Orders> findByUser(User user);

    // Get order by ID with user, orderItems, product, and variant eagerly fetched
    @Query("SELECT o FROM Orders o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.product p " +
           "LEFT JOIN FETCH oi.variant v " +
           "WHERE o.OrdersId = :id")
    Optional<Orders> findByIdWithUser(@Param("id") Long id);

       // Find orders where any order item's product belongs to a specific seller
       // LEFT JOIN FETCH user to eagerly load user data for customerName/customerPhone
       // getters
       // LEFT JOIN FETCH orderItems, product, and variant to eagerly load relationships
       // LEFT JOIN ensures orders are included even if user is null
       @Query("SELECT DISTINCT o FROM Orders o " +
                     "LEFT JOIN FETCH o.user " +
                     "LEFT JOIN FETCH o.orderItems oi " +
                     "LEFT JOIN FETCH oi.product p " +
                     "LEFT JOIN FETCH oi.variant v " +
                     "JOIN oi.product p2 " +
                     "WHERE p2.seller.sellerId = :sellerId " +
                     "ORDER BY o.creationTime DESC")
       List<Orders> findBySellerId(@Param("sellerId") Long sellerId);

}
