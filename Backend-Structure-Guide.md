# Complete Spring Boot + PostgreSQL Backend Structure Guide

## 📚 What is a Backend?
Think of the backend as the **brain** of your app. While your React Native app (frontend) is what users see and interact with, the backend:
- Stores all your data (products, orders, users) in a database
- Processes business logic (calculating totals, validating orders)
- Provides APIs (endpoints) that your mobile app calls to get/send data
- Handles security (authentication, authorization)

---

## 🏗️ Complete Project Structure

```
SakhiC-Backend/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── sakhilc/
│       │           └── backend/
│       │               │
│       │               ├── SakhiCBackendApplication.java    # Main entry point (like index.js)
│       │               │
│       │               ├── config/                          # Configuration files
│       │               │   ├── DatabaseConfig.java          # Database connection settings
│       │               │   ├── SecurityConfig.java          # Security & authentication rules
│       │               │   ├── CorsConfig.java              # Allow React Native app to connect
│       │               │   └── WebConfig.java                # General web settings
│       │               │
│       │               ├── model/                           # Database Tables (Entities)
│       │               │   ├── User.java                    # User/Shopkeeper account
│       │               │   ├── Product.java                 # Products table
│       │               │   ├── Category.java                # Categories table
│       │               │   ├── Collection.java              # Collections table
│       │               │   ├── Order.java                   # Orders table
│       │               │   ├── OrderItem.java               # Order items (products in order)
│       │               │   ├── Customer.java                # Customer information
│       │               │   ├── Store.java                   # Store settings
│       │               │   └── Analytics.java               # Analytics data
│       │               │
│       │               ├── repository/                     # Database Access Layer
│       │               │   ├── UserRepository.java          # Functions to query User table
│       │               │   ├── ProductRepository.java       # Functions to query Product table
│       │               │   ├── CategoryRepository.java      # Functions to query Category table
│       │               │   ├── CollectionRepository.java   # Functions to query Collection table
│       │               │   ├── OrderRepository.java        # Functions to query Order table
│       │               │   ├── OrderItemRepository.java    # Functions to query OrderItem table
│       │               │   ├── CustomerRepository.java    # Functions to query Customer table
│       │               │   └── StoreRepository.java         # Functions to query Store table
│       │               │
│       │               ├── service/                        # Business Logic Layer
│       │               │   ├── UserService.java            # User-related business logic
│       │               │   ├── ProductService.java         # Product business logic (add, update, delete)
│       │               │   ├── CategoryService.java        # Category business logic
│       │               │   ├── CollectionService.java      # Collection business logic
│       │               │   ├── OrderService.java           # Order processing logic
│       │               │   ├── CustomerService.java        # Customer management
│       │               │   ├── StoreService.java           # Store settings management
│       │               │   ├── AnalyticsService.java       # Analytics calculations
│       │               │   └── FileStorageService.java      # Image upload handling
│       │               │
│       │               ├── controller/                     # API Endpoints (what mobile app calls)
│       │               │   ├── AuthController.java          # Login, Register, Logout APIs
│       │               │   ├── ProductController.java       # Product CRUD APIs
│       │               │   ├── CategoryController.java      # Category CRUD APIs
│       │               │   ├── CollectionController.java    # Collection CRUD APIs
│       │               │   ├── OrderController.java         # Order management APIs
│       │               │   ├── CustomerController.java      # Customer APIs
│       │               │   ├── StoreController.java        # Store settings APIs
│       │               │   ├── AnalyticsController.java     # Analytics APIs
│       │               │   └── FileController.java           # Image upload/download APIs
│       │               │
│       │               ├── dto/                            # Data Transfer Objects (API Request/Response)
│       │               │   ├── request/                    # What mobile app SENDS to backend
│       │               │   │   ├── LoginRequest.java        # Login credentials
│       │               │   │   ├── ProductRequest.java      # Product data when creating/updating
│       │               │   │   ├── CategoryRequest.java     # Category data
│       │               │   │   ├── CollectionRequest.java   # Collection data
│       │               │   │   ├── OrderRequest.java        # Order creation data
│       │               │   │   └── StoreUpdateRequest.java  # Store settings update
│       │               │   │
│       │               │   └── response/                   # What backend SENDS to mobile app
│       │               │       ├── ApiResponse.java         # Standard API response wrapper
│       │               │       ├── LoginResponse.java       # Login response with token
│       │               │       ├── ProductResponse.java     # Product data response
│       │               │       ├── CategoryResponse.java    # Category data response
│       │               │       ├── CollectionResponse.java  # Collection data response
│       │               │       ├── OrderResponse.java       # Order data response
│       │               │       ├── HomeScreenResponse.java  # Home screen data
│       │               │       └── AnalyticsResponse.java   # Analytics data
│       │               │
│       │               ├── exception/                      # Error Handling
│       │               │   ├── GlobalExceptionHandler.java # Catches all errors and returns friendly messages
│       │               │   ├── ResourceNotFoundException.java # When data not found
│       │               │   ├── BadRequestException.java    # When request is invalid
│       │               │   └── UnauthorizedException.java  # When user not logged in
│       │               │
│       │               ├── security/                       # Security & Authentication
│       │               │   ├── JwtTokenProvider.java        # Creates/validates JWT tokens
│       │               │   ├── JwtAuthenticationFilter.java # Checks token on each request
│       │               │   └── UserPrincipal.java          # Current logged-in user info
│       │               │
│       │               └── util/                           # Helper/Utility Classes
│       │                   ├── FileUtils.java              # File handling helpers
│       │                   ├── DateUtils.java              # Date formatting helpers
│       │                   └── ValidationUtils.java        # Input validation helpers
│       │
│       └── resources/
│           ├── application.properties                     # Main configuration file
│           ├── application-dev.properties                # Development environment config
│           ├── application-prod.properties               # Production environment config
│           └── db/
│               └── migration/                            # Database migration scripts
│                   ├── V1__Create_tables.sql             # Initial database structure
│                   └── V2__Add_indexes.sql                # Performance improvements
│
├── pom.xml                                                # Maven dependencies file (like package.json)
├── .gitignore                                             # Files to ignore in git
└── README.md                                              # Project documentation
```

---

## 📖 Detailed Explanation of Each Folder

### 1. **`src/main/java/com/sakhilc/backend/`** - Main Code Directory
This is where all your Java code lives. Think of it like your `src/` folder in React Native.

---

### 2. **`SakhiCBackendApplication.java`** - Entry Point
**What it does:** This is like `index.js` in your React Native app. It starts the entire Spring Boot application.

**Why you need it:** Spring Boot needs a starting point to launch the server.

---

### 3. **`config/`** - Configuration Files
**What it does:** Contains settings for your application.

**Files:**
- **`DatabaseConfig.java`**: Tells Spring Boot how to connect to PostgreSQL
- **`SecurityConfig.java`**: Defines who can access what (authentication rules)
- **`CorsConfig.java`**: Allows your React Native app to make API calls (prevents CORS errors)
- **`WebConfig.java`**: General web settings

**Why you need it:** Without these, your app won't know how to connect to the database or handle security.

---

### 4. **`model/`** - Database Tables (Entities)
**What it does:** These Java classes represent your database tables. Each class = one table.

**Example:**
- `Product.java` = Products table in PostgreSQL
- `Order.java` = Orders table in PostgreSQL

**Why you need it:** Spring Boot uses these to create and manage database tables automatically.

**Key files:**
- `User.java`: Shopkeeper account information
- `Product.java`: Product details (name, price, images, etc.)
- `Category.java`: Product categories
- `Collection.java`: Product collections
- `Order.java`: Order information
- `OrderItem.java`: Individual products in an order
- `Customer.java`: Customer information
- `Store.java`: Store settings and configuration

---

### 5. **`repository/`** - Database Access Layer
**What it does:** These interfaces contain functions to query the database. They're like "database helpers."

**Example:**
- `ProductRepository.findByName()` - Find products by name
- `OrderRepository.findByStatus()` - Find orders by status

**Why you need it:** You can't directly write SQL queries everywhere. Repositories provide clean, reusable database functions.

**How it works:** Spring Boot automatically creates these functions based on method names. You just define what you need!

---

### 6. **`service/`** - Business Logic Layer
**What it does:** Contains the actual business logic - calculations, validations, and data processing.

**Example:**
- `ProductService.createProduct()` - Validates product data, saves images, then saves to database
- `OrderService.calculateTotal()` - Calculates order total from items
- `OrderService.updateStatus()` - Updates order status and sends notifications

**Why you need it:** Separates business logic from database access. Makes code cleaner and easier to test.

---

### 7. **`controller/`** - API Endpoints
**What it does:** These are the URLs your React Native app calls. Like `/api/products` or `/api/orders`.

**Example:**
```
GET /api/products          → Get all products
POST /api/products         → Create new product
PUT /api/products/{id}     → Update product
DELETE /api/products/{id}  → Delete product
```

**Why you need it:** Your mobile app needs specific URLs to send/receive data. Controllers provide these endpoints.

**Key files:**
- `ProductController.java`: Product-related APIs
- `OrderController.java`: Order-related APIs
- `CategoryController.java`: Category-related APIs
- `CollectionController.java`: Collection-related APIs
- `AnalyticsController.java`: Analytics data APIs

---

### 8. **`dto/`** - Data Transfer Objects
**What it does:** Defines the structure of data sent/received between mobile app and backend.

**Two subfolders:**
- **`request/`**: What mobile app sends to backend
- **`response/`**: What backend sends to mobile app

**Why you need it:** Ensures data format is consistent and validated. Prevents errors from wrong data types.

**Example:**
- `ProductRequest.java`: When creating a product, mobile app sends: `{name: "Soap", price: 50, ...}`
- `ProductResponse.java`: Backend sends back: `{id: 1, name: "Soap", price: 50, createdAt: "..."}`

---

### 9. **`exception/`** - Error Handling
**What it does:** Handles errors gracefully and returns user-friendly error messages.

**Why you need it:** Instead of showing technical errors, shows messages like "Product not found" or "Invalid email address".

**Key files:**
- `GlobalExceptionHandler.java`: Catches all errors and formats them nicely
- `ResourceNotFoundException.java`: When something doesn't exist
- `BadRequestException.java`: When request data is invalid

---

### 10. **`security/`** - Authentication & Authorization
**What it does:** Handles user login, JWT tokens, and protects API endpoints.

**Why you need it:** Prevents unauthorized access. Only logged-in shopkeepers can manage their products/orders.

**Key files:**
- `JwtTokenProvider.java`: Creates and validates login tokens
- `JwtAuthenticationFilter.java`: Checks if user is logged in on each request

---

### 11. **`util/`** - Helper Classes
**What it does:** Reusable utility functions used across the application.

**Why you need it:** Avoids code duplication. Common functions like file upload, date formatting, etc.

---

### 12. **`resources/`** - Configuration Files
**What it does:** Contains configuration files in plain text format.

**Key files:**
- **`application.properties`**: Main config file with database URL, port, etc.
- **`application-dev.properties`**: Development environment settings
- **`application-prod.properties`**: Production environment settings

**Why you need it:** Stores database credentials, API keys, and other settings.

---

## 🔄 How Data Flows (Step by Step)

### Example: Creating a Product

1. **Mobile App** → Calls `POST /api/products` with product data
2. **ProductController** → Receives the request
3. **ProductController** → Calls `ProductService.createProduct()`
4. **ProductService** → Validates data, uploads images
5. **ProductService** → Calls `ProductRepository.save()`
6. **ProductRepository** → Saves to PostgreSQL database
7. **ProductRepository** → Returns saved product
8. **ProductService** → Returns product to controller
9. **ProductController** → Sends response back to mobile app
10. **Mobile App** → Shows success message

**Flow:**
```
Mobile App → Controller → Service → Repository → Database
           ←            ←          ←            ←
```

---

## 🗄️ Database Tables (PostgreSQL)

Based on your app, here are the main tables:

1. **users** - Shopkeeper accounts
2. **products** - Product catalog
3. **categories** - Product categories
4. **collections** - Product collections
5. **collection_products** - Many-to-many: products in collections
6. **orders** - Customer orders
7. **order_items** - Products in each order
8. **customers** - Customer information
9. **stores** - Store settings and configuration
10. **analytics** - Analytics data (or computed from orders)

---

## 📝 Key Dependencies You'll Need (in pom.xml)

```xml
<!-- Spring Boot Starter Web (for REST APIs) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Data JPA (for database access) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<!-- Spring Security (for authentication) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT (for tokens) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>

<!-- File Upload (for images) -->
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
```

---

## 🚀 Getting Started Steps

1. **Create Spring Boot Project**
   - Use Spring Initializr (start.spring.io)
   - Select: Web, JPA, PostgreSQL, Security

2. **Set up PostgreSQL Database**
   - Install PostgreSQL
   - Create database: `sakhilc_db`
   - Update `application.properties` with connection details

3. **Create Models**
   - Start with `User.java`, `Product.java`, `Order.java`
   - Spring Boot will create tables automatically

4. **Create Repositories**
   - Create interfaces extending `JpaRepository`
   - Spring Boot generates query methods automatically

5. **Create Services**
   - Add business logic
   - Call repositories to save/fetch data

6. **Create Controllers**
   - Define API endpoints
   - Call services to handle requests

7. **Test APIs**
   - Use Postman to test endpoints
   - Connect React Native app to backend

---

## 🔗 API Endpoints You'll Need

Based on your app screens:

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create collection
- `PUT /api/collections/{id}` - Update collection
- `POST /api/collections/{id}/products` - Add products to collection

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders?status=pending` - Filter by status
- `GET /api/orders/{id}` - Get single order
- `PUT /api/orders/{id}/status` - Update order status

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/sales` - Sales statistics

### Home
- `GET /api/home` - Get home screen data (dashboard)

---

## 💡 Important Concepts for Beginners

### 1. **Layered Architecture**
- **Controller** (API layer) → **Service** (Business logic) → **Repository** (Database) → **Database**

### 2. **Dependency Injection**
Spring Boot automatically creates objects and injects them where needed. You don't manually create objects.

### 3. **Annotations**
- `@Entity` - Marks a class as a database table
- `@RestController` - Marks a class as API endpoints
- `@Service` - Marks a class as business logic
- `@Repository` - Marks a class as database access
- `@Autowired` - Injects dependencies automatically

### 4. **REST API**
- GET - Fetch data
- POST - Create new data
- PUT - Update existing data
- DELETE - Remove data

---

## 🎯 Next Steps

1. Set up Spring Boot project
2. Configure PostgreSQL connection
3. Create models (User, Product, Order, etc.)
4. Create repositories
5. Create services with business logic
6. Create controllers with API endpoints
7. Test with Postman
8. Connect React Native app

---

This structure will give you a professional, scalable backend that can handle all your app's features!

