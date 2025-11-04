# Backend Example Code - Spring Boot + PostgreSQL

This file shows **real code examples** for each layer of your backend. Use these as templates!

---

## 📋 Table of Contents

1. [Model (Database Table)](#1-model-database-table)
2. [Repository (Database Queries)](#2-repository-database-queries)
3. [Service (Business Logic)](#3-service-business-logic)
4. [Controller (API Endpoints)](#4-controller-api-endpoints)
5. [DTO (Request/Response)](#5-dto-requestresponse)
6. [Configuration](#6-configuration)

---

## 1. Model (Database Table)

### Product.java
```java
package com.sakhilc.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double price;
    
    private Double mrp;  // Maximum Retail Price
    
    @Column(name = "in_stock")
    private Boolean inStock = true;
    
    private String imageUrl;  // Path to product image
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne
    @JoinColumn(name = "user_id")  // Which shopkeeper owns this product
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Double getMrp() { return mrp; }
    public void setMrp(Double mrp) { this.mrp = mrp; }
    
    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Automatically set timestamps before saving
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Order.java
```java
package com.sakhilc.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number", unique = true)
    private String orderNumber;  // e.g., "ORD-2024-001"
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @ManyToOne
    @JoinColumn(name = "user_id")  // Shopkeeper
    private User user;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "total_amount")
    private Double totalAmount;
    
    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    @Column(name = "order_date")
    private LocalDateTime orderDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters and Setters
    // ... (similar to Product)
    
    public enum OrderStatus {
        PENDING, ACCEPTED, SHIPPED, PICKUP_READY, 
        DELIVERED, CANCELED, REJECTED
    }
    
    public enum PaymentStatus {
        PAID, PENDING, UNPAID, REFUNDED
    }
}
```

### Category.java
```java
package com.sakhilc.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 30)
    private String name;
    
    @Column(columnDefinition = "TEXT", length = 250)
    private String description;
    
    private String imageUrl;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters and Setters
    // ... (similar pattern)
}
```

---

## 2. Repository (Database Queries)

### ProductRepository.java
```java
package com.sakhilc.backend.repository;

import com.sakhilc.backend.model.Product;
import com.sakhilc.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find all products by shopkeeper
    List<Product> findByUser(User user);
    
    // Find products by name (search)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Find products by stock status
    List<Product> findByInStock(Boolean inStock);
    
    // Find products by category
    List<Product> findByCategoryId(Long categoryId);
    
    // Find products by shopkeeper and stock status
    List<Product> findByUserAndInStock(User user, Boolean inStock);
    
    // Find products with price range
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
}
```

**Note:** Spring Boot automatically creates these query methods! You just define the method name, and it works!

### OrderRepository.java
```java
package com.sakhilc.backend.repository;

import com.sakhilc.backend.model.Order;
import com.sakhilc.backend.model.Order.OrderStatus;
import com.sakhilc.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders by shopkeeper
    List<Order> findByUser(User user);
    
    // Find orders by status
    List<Order> findByStatus(OrderStatus status);
    
    // Find orders by shopkeeper and status
    List<Order> findByUserAndStatus(User user, OrderStatus status);
    
    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);
}
```

---

## 3. Service (Business Logic)

### ProductService.java
```java
package com.sakhilc.backend.service;

import com.sakhilc.backend.model.Product;
import com.sakhilc.backend.model.User;
import com.sakhilc.backend.repository.ProductRepository;
import com.sakhilc.backend.dto.request.ProductRequest;
import com.sakhilc.backend.dto.response.ProductResponse;
import com.sakhilc.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // Get all products for a shopkeeper
    public List<ProductResponse> getAllProducts(User user) {
        List<Product> products = productRepository.findByUser(user);
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get single product
    public ProductResponse getProductById(Long id, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if product belongs to this shopkeeper
        if (!product.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        return convertToResponse(product);
    }
    
    // Create new product
    public ProductResponse createProduct(ProductRequest request, User user) {
        // Validate data
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException("Valid price is required");
        }
        
        // Create product object
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setInStock(request.getInStock() != null ? request.getInStock() : true);
        product.setUser(user);
        
        // Handle image upload if provided
        if (request.getImage() != null) {
            String imageUrl = fileStorageService.storeFile(request.getImage());
            product.setImageUrl(imageUrl);
        }
        
        // Save to database
        Product savedProduct = productRepository.save(product);
        
        return convertToResponse(savedProduct);
    }
    
    // Update product
    public ProductResponse updateProduct(Long id, ProductRequest request, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check ownership
        if (!product.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        // Update fields
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getMrp() != null) {
            product.setMrp(request.getMrp());
        }
        if (request.getInStock() != null) {
            product.setInStock(request.getInStock());
        }
        
        // Update image if provided
        if (request.getImage() != null) {
            String imageUrl = fileStorageService.storeFile(request.getImage());
            product.setImageUrl(imageUrl);
        }
        
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    // Delete product
    public void deleteProduct(Long id, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException("Product not found"));
        
        // Check ownership
        if (!product.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        productRepository.delete(product);
    }
    
    // Convert Product to ProductResponse
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setMrp(product.getMrp());
        response.setInStock(product.getInStock());
        response.setImageUrl(product.getImageUrl());
        response.setCreatedAt(product.getCreatedAt());
        return response;
    }
}
```

### OrderService.java
```java
package com.sakhilc.backend.service;

import com.sakhilc.backend.model.Order;
import com.sakhilc.backend.model.Order.OrderStatus;
import com.sakhilc.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    // Get all orders for shopkeeper
    public List<Order> getAllOrders(User user) {
        return orderRepository.findByUser(user);
    }
    
    // Get orders by status
    public List<Order> getOrdersByStatus(User user, OrderStatus status) {
        return orderRepository.findByUserAndStatus(user, status);
    }
    
    // Update order status
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Check ownership
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found");
        }
        
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
    // Calculate order total
    public Double calculateOrderTotal(Order order) {
        return order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}
```

---

## 4. Controller (API Endpoints)

### ProductController.java
```java
package com.sakhilc.backend.controller;

import com.sakhilc.backend.dto.request.ProductRequest;
import com.sakhilc.backend.dto.response.ApiResponse;
import com.sakhilc.backend.dto.response.ProductResponse;
import com.sakhilc.backend.model.User;
import com.sakhilc.backend.security.UserPrincipal;
import com.sakhilc.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")  // Allow React Native app to connect
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    // GET /api/products - Get all products
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        List<ProductResponse> products = productService.getAllProducts(user);
        
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>(
                true, "Products retrieved successfully", products);
        
        return ResponseEntity.ok(response);
    }
    
    // GET /api/products/{id} - Get single product
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        ProductResponse product = productService.getProductById(id, user);
        
        ApiResponse<ProductResponse> response = new ApiResponse<>(
                true, "Product retrieved successfully", product);
        
        return ResponseEntity.ok(response);
    }
    
    // POST /api/products - Create new product
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @ModelAttribute ProductRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        ProductResponse product = productService.createProduct(request, user);
        
        ApiResponse<ProductResponse> response = new ApiResponse<>(
                true, "Product created successfully", product);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // PUT /api/products/{id} - Update product
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        ProductResponse product = productService.updateProduct(id, request, user);
        
        ApiResponse<ProductResponse> response = new ApiResponse<>(
                true, "Product updated successfully", product);
        
        return ResponseEntity.ok(response);
    }
    
    // DELETE /api/products/{id} - Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        productService.deleteProduct(id, user);
        
        ApiResponse<Void> response = new ApiResponse<>(
                true, "Product deleted successfully", null);
        
        return ResponseEntity.ok(response);
    }
}
```

### OrderController.java
```java
package com.sakhilc.backend.controller;

import com.sakhilc.backend.model.Order;
import com.sakhilc.backend.model.Order.OrderStatus;
import com.sakhilc.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    // GET /api/orders - Get all orders
    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        List<Order> orders = orderService.getAllOrders(user);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved", orders));
    }
    
    // GET /api/orders?status=pending - Filter by status
    @GetMapping(params = "status")
    public ResponseEntity<ApiResponse<List<Order>>> getOrdersByStatus(
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        List<Order> orders = orderService.getOrdersByStatus(user, status);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved", orders));
    }
    
    // PUT /api/orders/{id}/status - Update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userPrincipal.getUser();
        Order order = orderService.updateOrderStatus(id, status, user);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Order status updated", order));
    }
}
```

---

## 5. DTO (Request/Response)

### ProductRequest.java (What mobile app sends)
```java
package com.sakhilc.backend.dto.request;

import org.springframework.web.multipart.MultipartFile;

public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private Double mrp;
    private Boolean inStock;
    private Long categoryId;
    private MultipartFile image;  // For file upload
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Double getMrp() { return mrp; }
    public void setMrp(Double mrp) { this.mrp = mrp; }
    
    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}
```

### ProductResponse.java (What backend sends)
```java
package com.sakhilc.backend.dto.response;

import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double mrp;
    private Boolean inStock;
    private String imageUrl;
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    // ... (other getters and setters)
}
```

### ApiResponse.java (Standard response wrapper)
```java
package com.sakhilc.backend.dto.response;

public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    
    public ApiResponse(Boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Getters and Setters
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
```

---

## 6. Configuration

### application.properties
```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhilc_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# JWT Configuration
jwt.secret=your-secret-key-here-make-it-long-and-random
jwt.expiration=86400000  # 24 hours in milliseconds
```

### SecurityConfig.java
```java
package com.sakhilc.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Disable CSRF for API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Public endpoints
                .anyRequest().authenticated()  // All other endpoints require authentication
            );
        
        return http.build();
    }
}
```

---

## 🎯 How to Use These Examples

1. **Copy the Model code** → Create `Product.java`, `Order.java`, etc.
2. **Copy the Repository code** → Create `ProductRepository.java`, etc.
3. **Copy the Service code** → Create `ProductService.java`, etc.
4. **Copy the Controller code** → Create `ProductController.java`, etc.
5. **Copy the DTO code** → Create request/response classes
6. **Update configuration** → Set database credentials

These are working examples you can use as templates!

---

**Note:** Remember to:
- Replace `User` with your actual User model
- Add proper error handling
- Add validation annotations
- Configure security properly
- Test with Postman before connecting to mobile app

