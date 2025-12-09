package com.smartbiz.sakhistore.modules.order.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.customer_user.model.User;



@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {

    List<Orders> findByUser(User user);

    // Find orders where any order item's product belongs to a specific seller
    @Query("SELECT DISTINCT o FROM Orders o " +
           "JOIN o.orderItems oi " +
           "JOIN oi.product p " +
           "WHERE p.seller.sellerId = :sellerId " +
           "ORDER BY o.creationTime DESC")
    List<Orders> findBySellerId(@Param("sellerId") Long sellerId);

}

