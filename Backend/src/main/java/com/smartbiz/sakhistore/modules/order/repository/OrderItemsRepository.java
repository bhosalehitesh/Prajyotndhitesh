package com.smartbiz.sakhistore.modules.order.repository;

import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.product.model.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {

    List<OrderItems> findByCart(Cart cart);

    List<OrderItems> findByOrders(Orders orders);
    
    OrderItems findByCartAndProduct(Cart cart, Product product);
}
