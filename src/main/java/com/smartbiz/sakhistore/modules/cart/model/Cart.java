package com.smartbiz.sakhistore.modules.cart.model;

import com.smartbiz.sakhistore.modules.order.model.OrderItems;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.smartbiz.sakhistore.modules.customer_user.model.User;


import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @OneToOne
    private User user;


    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItems> items = new ArrayList<>();

    // ✅ Getters and Setters (Lombok covers them, but included for clarity)
    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<OrderItems> getItems() {
        return items;
    }

    public void setItems(List<OrderItems> items) {
        this.items = items;
    }
}
