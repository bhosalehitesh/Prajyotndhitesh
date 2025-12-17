package com.smartbiz.sakhistore.modules.order.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.smartbiz.sakhistore.modules.cart.model.Cart;
import com.smartbiz.sakhistore.modules.product.model.Product;
import com.smartbiz.sakhistore.modules.product.model.ProductVariant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long OrderItemsId;


    private Integer quantity;

    private Double price;

    // =======================
    // VARIANT SUPPORT (SmartBiz: cart uses variants, not products)
    // =======================
    @ManyToOne
    @JoinColumn(name = "variant_id")
    @JsonIgnore  // Prevent circular references in JSON
    private ProductVariant variant;

    @ManyToOne
    @JsonBackReference  // Child side - don't serialize this to prevent circular reference
    private Orders orders;

    @ManyToOne
    private Product product;  // Keep for backward compatibility, but prefer variant

    @ManyToOne
    @JsonIgnore
    private Cart cart;


    public Long getOrderItemsId() {
        return OrderItemsId;
    }

    public void setOrderItemsId(Long orderItemsId) {
        OrderItemsId = orderItemsId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

}