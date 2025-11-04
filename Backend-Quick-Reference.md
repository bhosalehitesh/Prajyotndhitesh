# Backend Quick Reference - Spring Boot + PostgreSQL

## 🎯 Quick Overview

```
React Native App (Frontend)
         ↓
    HTTP Requests
         ↓
Spring Boot Backend
    ├── Controller (API Endpoints)
    ├── Service (Business Logic)
    ├── Repository (Database Queries)
    └── Model (Database Tables)
         ↓
   PostgreSQL Database
```

---

## 📁 Folder Structure (Simplified)

```
backend/
├── model/          → Database tables (Product, Order, User)
├── repository/     → Database queries (findBy, save, delete)
├── service/        → Business logic (calculations, validations)
├── controller/     → API endpoints (/api/products, /api/orders)
├── dto/            → Request/Response data structures
├── config/         → Database, security settings
└── exception/      → Error handling
```

---

## 🔄 Request Flow (Simple Example)

**User creates a product in mobile app:**

1. Mobile App → `POST /api/products` with product data
2. Controller receives request
3. Service validates and processes data
4. Repository saves to database
5. Response sent back to mobile app

---

## 📊 Database Tables Needed

| Table | Purpose |
|-------|---------|
| `users` | Shopkeeper accounts |
| `products` | Product catalog |
| `categories` | Product categories |
| `collections` | Product collections |
| `collection_products` | Links products to collections |
| `orders` | Customer orders |
| `order_items` | Products in each order |
| `customers` | Customer information |
| `stores` | Store settings |

---

## 🛠️ Key Technologies

- **Spring Boot**: Java framework for backend
- **PostgreSQL**: Database to store data
- **JPA/Hibernate**: Maps Java classes to database tables
- **JWT**: Token-based authentication
- **Spring Security**: Handles security and authentication

---

## 📝 Common API Endpoints

### Products
```
GET    /api/products           → Get all products
POST   /api/products           → Create product
PUT    /api/products/{id}      → Update product
DELETE /api/products/{id}      → Delete product
```

### Orders
```
GET    /api/orders             → Get all orders
GET    /api/orders?status=pending → Filter orders
PUT    /api/orders/{id}/status → Update order status
```

### Categories
```
GET    /api/categories         → Get all categories
POST   /api/categories         → Create category
PUT    /api/categories/{id}    → Update category
DELETE /api/categories/{id}    → Delete category
```

### Collections
```
GET    /api/collections        → Get all collections
POST   /api/collections        → Create collection
POST   /api/collections/{id}/products → Add products
```

---

## 🔑 Key Spring Boot Annotations

| Annotation | Purpose |
|------------|---------|
| `@Entity` | Marks class as database table |
| `@RestController` | Marks class as API controller |
| `@Service` | Marks class as business logic |
| `@Repository` | Marks class as database access |
| `@Autowired` | Injects dependencies automatically |
| `@GetMapping` | Maps GET request to method |
| `@PostMapping` | Maps POST request to method |
| `@PutMapping` | Maps PUT request to method |
| `@DeleteMapping` | Maps DELETE request to method |

---

## 📦 Essential Dependencies (pom.xml)

```xml
<!-- Web APIs -->
spring-boot-starter-web

<!-- Database -->
spring-boot-starter-data-jpa
postgresql

<!-- Security -->
spring-boot-starter-security
jjwt (JWT tokens)

<!-- File Upload -->
commons-fileupload
```

---

## 🗂️ File Naming Convention

- **Models**: `Product.java`, `Order.java`, `User.java`
- **Repositories**: `ProductRepository.java`, `OrderRepository.java`
- **Services**: `ProductService.java`, `OrderService.java`
- **Controllers**: `ProductController.java`, `OrderController.java`
- **DTOs**: `ProductRequest.java`, `ProductResponse.java`

---

## 🔐 Security Flow

1. User logs in → Backend returns JWT token
2. Mobile app stores token
3. Mobile app sends token with every API request
4. Backend validates token
5. If valid → Process request
6. If invalid → Return 401 Unauthorized

---

## 📋 Configuration File (application.properties)

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/sakhilc_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# Server Port
server.port=8080

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 🚀 Development Workflow

1. **Create Model** → Define database table structure
2. **Create Repository** → Define database queries
3. **Create Service** → Add business logic
4. **Create Controller** → Define API endpoints
5. **Test with Postman** → Verify API works
6. **Connect Mobile App** → Update React Native API calls

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS error | Add `@CrossOrigin` in Controller |
| Database connection fails | Check `application.properties` credentials |
| 401 Unauthorized | Check JWT token in request header |
| 404 Not Found | Verify API endpoint URL matches |
| 500 Internal Error | Check server logs for details |

---

## 📚 Learning Resources

1. **Spring Boot Documentation**: https://spring.io/projects/spring-boot
2. **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
3. **JPA Guide**: https://www.baeldung.com/jpa-entities
4. **REST API Design**: https://restfulapi.net/

---

## ✅ Checklist for Backend Setup

- [ ] Install Java JDK 17+
- [ ] Install PostgreSQL
- [ ] Create Spring Boot project
- [ ] Configure database connection
- [ ] Create User model and authentication
- [ ] Create Product model, repository, service, controller
- [ ] Create Order model, repository, service, controller
- [ ] Create Category and Collection models
- [ ] Set up file upload for images
- [ ] Configure CORS for React Native
- [ ] Test APIs with Postman
- [ ] Connect React Native app

---

This is your quick reference guide! Keep it handy while building your backend.

