package com.smartbiz.sakhistore.modules.order.service;

import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.cart.repository.CartRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrderItemsRepository;
import com.smartbiz.sakhistore.modules.order.repository.OrdersRepository;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemsService {

    private final OrderItemsRepository orderItemsRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrdersRepository ordersRepository;

    public OrderItemsService(OrderItemsRepository orderItemsRepository,
                             ProductRepository productRepository,
                             CartRepository cartRepository,
                             OrdersRepository ordersRepository) {

        this.orderItemsRepository = orderItemsRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.ordersRepository = ordersRepository;
    }

    // =============================
    // GET ALL ORDER ITEMS
    // =============================
    public List<OrderItems> getAllOrderItems() {
        return orderItemsRepository.findAll();
    }

    // =============================
    // GET BY ORDER
    // =============================
    public List<OrderItems> getOrderItemsByOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return orderItemsRepository.findByOrders(order);
    }

    // =============================
    // GET BY CART
    // =============================
    public List<OrderItems> getOrderItemsByCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        return orderItemsRepository.findByCart(cart);
    }

    // =============================
    // CREATE ORDER ITEM
    // =============================
    public OrderItems createOrderItem(Long productId, Long cartId, Integer quantity) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart Not Found"));

        OrderItems item = new OrderItems();
        item.setProduct(product);
        item.setCart(cart);
        item.setQuantity(quantity);
        item.setPrice(product.getSellingPrice() * quantity);

        return orderItemsRepository.save(item);
    }

    // =============================
    // UPDATE ORDER ITEM
    // =============================
    public OrderItems updateOrderItem(Long itemId, Integer quantity) {

        OrderItems item = orderItemsRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Order Item not found"));

        if (quantity <= 0) {
            orderItemsRepository.delete(item);
            return null;
        }

        item.setQuantity(quantity);
        item.setPrice(item.getProduct().getSellingPrice() * quantity);

        return orderItemsRepository.save(item);
    }

    // =============================
    // DELETE ORDER ITEM
    // =============================
    public void deleteOrderItem(Long itemId) {
        orderItemsRepository.deleteById(itemId);
    }
}

