[//]: # (sakhi-store/)

[//]: # (│)

[//]: # (├── pom.xml                                  # Maven build file &#40;dependencies, plugins&#41;)

[//]: # (├── .gitignore)

[//]: # (├── README.md)

[//]: # (├── LICENSE)

[//]: # (│)

[//]: # (├── docker/                                  # 🐳 Docker setup)

[//]: # (│   ├── Dockerfile                           # For containerizing backend)

[//]: # (│   ├── docker-compose.yml                   # For PostgreSQL + app setup)

[//]: # (│   ├── init-db.sql                          # DB initialization)

[//]: # (│   └── README.md)

[//]: # (│)

[//]: # (├── docs/                                    # 📚 Documentation & design assets)

[//]: # (│   ├── architecture-diagram.png             # System architecture)

[//]: # (│   ├── er-diagram.png                       # ER diagram of DB schema)

[//]: # (│   ├── api-endpoints.md                     # REST API documentation)

[//]: # (│   ├── deployment-guide.md                  # DevOps deployment steps)

[//]: # (│   ├── setup-guide.md                       # How to set up locally)

[//]: # (│   └── changelog.md                         # Version logs & updates)

[//]: # (│)

[//]: # (├── scripts/                                 # ⚙️ Automation scripts)

[//]: # (│   ├── start-local.sh                       # Start local dev environment)

[//]: # (│   ├── stop-local.sh                        # Stop environment)

[//]: # (│   ├── db-backup.sh                         # PostgreSQL backup)

[//]: # (│   └── migrate.sh                           # Flyway DB migration)

[//]: # (│)

[//]: # (├── .github/                                 # 🔄 CI/CD workflows)

[//]: # (│   └── workflows/)

[//]: # (│       └── build-deploy.yml                 # GitHub Actions pipeline)

[//]: # (│)

[//]: # (├── src/)

[//]: # (│   ├── main/)

[//]: # (│   │   ├── java/)

[//]: # (│   │   │   └── com/)

[//]: # (│   │   │       └── smartbiz/)

[//]: # (│   │   │           └── sakhistore/)

[//]: # (│   │   │               ├── SakhiStoreApplication.java     # 🎯 Main Spring Boot entry point)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── config/                        # ⚙️ Configuration classes)

[//]: # (│   │   │               │   ├── SwaggerConfig.java         # OpenAPI config)

[//]: # (│   │   │               │   ├── SecurityConfig.java        # Spring Security + JWT setup)

[//]: # (│   │   │               │   ├── WebConfig.java             # CORS & Web MVC setup)

[//]: # (│   │   │               │   ├── AppConfig.java             # Bean configs)

[//]: # (│   │   │               │   └── AppProperties.java         # Custom app properties)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── constants/                     # 🔠 Common constants)

[//]: # (│   │   │               │   ├── AppConstants.java)

[//]: # (│   │   │               │   ├── ApiPaths.java)

[//]: # (│   │   │               │   └── ErrorMessages.java)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── exception/                     # 🚨 Exception handling)

[//]: # (│   │   │               │   ├── GlobalExceptionHandler.java)

[//]: # (│   │   │               │   ├── ResourceNotFoundException.java)

[//]: # (│   │   │               │   ├── InvalidOtpException.java)

[//]: # (│   │   │               │   ├── BusinessException.java)

[//]: # (│   │   │               │   └── UnauthorizedException.java)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── common/                        # 🧱 Generic models)

[//]: # (│   │   │               │   ├── ApiResponse.java)

[//]: # (│   │   │               │   ├── PaginationResponse.java)

[//]: # (│   │   │               │   └── ResponseStatus.java)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── utils/                         # 🧮 Utility helpers)

[//]: # (│   │   │               │   ├── JwtUtil.java)

[//]: # (│   │   │               │   ├── PasswordUtil.java)

[//]: # (│   │   │               │   ├── OtpUtil.java)

[//]: # (│   │   │               │   ├── DateUtil.java)

[//]: # (│   │   │               │   └── FileStorageUtil.java)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── security/                      # 🔐 Authentication layer)

[//]: # (│   │   │               │   ├── JwtAuthenticationFilter.java)

[//]: # (│   │   │               │   ├── JwtAuthorizationFilter.java)

[//]: # (│   │   │               │   ├── CustomUserDetailsService.java)

[//]: # (│   │   │               │   └── JwtTokenProvider.java)

[//]: # (│   │   │)

[//]: # (│   │   │               ├── modules/                       # 🧩 Main business modules)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   ├── auth/                      # 👤 Authentication & users)

[//]: # (│   │   │               │   │   ├── controller/)

[//]: # (│   │   │               │   │   │   └── AuthController.java)

[//]: # (│   │   │               │   │   ├── service/)

[//]: # (│   │   │               │   │   │   ├── AuthService.java)

[//]: # (│   │   │               │   │   │   └── UserService.java)

[//]: # (│   │   │               │   │   ├── repository/)

[//]: # (│   │   │               │   │   │   └── UserRepository.java)

[//]: # (│   │   │               │   │   ├── model/)

[//]: # (│   │   │               │   │   │   ├── User.java)

[//]: # (│   │   │               │   │   │   └── Role.java)

[//]: # (│   │   │               │   │   └── dto/)

[//]: # (│   │   │               │   │       ├── LoginRequest.java)

[//]: # (│   │   │               │   │       ├── RegisterRequest.java)

[//]: # (│   │   │               │   │       └── AuthResponse.java)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   ├── otp/                       # 📱 OTP Service &#40;Kutility API&#41;)

[//]: # (│   │   │               │   │   ├── controller/)

[//]: # (│   │   │               │   │   │   └── OtpController.java)

[//]: # (│   │   │               │   │   ├── service/)

[//]: # (│   │   │               │   │   │   └── OtpService.java)

[//]: # (│   │   │               │   │   ├── repository/)

[//]: # (│   │   │               │   │   │   └── OtpRepository.java)

[//]: # (│   │   │               │   │   ├── model/)

[//]: # (│   │   │               │   │   │   └── OtpLog.java)

[//]: # (│   │   │               │   │   └── dto/)

[//]: # (│   │   │               │   │       └── OtpRequest.java)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   ├── product/                   # 🛒 Product management)

[//]: # (│   │   │               │   │   ├── controller/)

[//]: # (│   │   │               │   │   │   └── ProductController.java)

[//]: # (│   │   │               │   │   ├── service/)

[//]: # (│   │   │               │   │   │   ├── ProductService.java)

[//]: # (│   │   │               │   │   │   └── CategoryService.java)

[//]: # (│   │   │               │   │   ├── repository/)

[//]: # (│   │   │               │   │   │   ├── ProductRepository.java)

[//]: # (│   │   │               │   │   │   └── CategoryRepository.java)

[//]: # (│   │   │               │   │   ├── model/)

[//]: # (│   │   │               │   │   │   ├── Product.java)

[//]: # (│   │   │               │   │   │   ├── Category.java)

[//]: # (│   │   │               │   │   │   └── Inventory.java)

[//]: # (│   │   │               │   │   └── dto/)

[//]: # (│   │   │               │   │       ├── ProductRequest.java)

[//]: # (│   │   │               │   │       └── ProductResponse.java)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   ├── order/                     # 🧾 Orders & Cart)

[//]: # (│   │   │               │   │   ├── controller/)

[//]: # (│   │   │               │   │   │   └── OrderController.java)

[//]: # (│   │   │               │   │   ├── service/)

[//]: # (│   │   │               │   │   │   ├── OrderService.java)

[//]: # (│   │   │               │   │   │   └── CartService.java)

[//]: # (│   │   │               │   │   ├── repository/)

[//]: # (│   │   │               │   │   │   ├── OrderRepository.java)

[//]: # (│   │   │               │   │   │   └── CartRepository.java)

[//]: # (│   │   │               │   │   ├── model/)

[//]: # (│   │   │               │   │   │   ├── Order.java)

[//]: # (│   │   │               │   │   │   ├── OrderItem.java)

[//]: # (│   │   │               │   │   │   └── Cart.java)

[//]: # (│   │   │               │   │   └── dto/)

[//]: # (│   │   │               │   │       ├── OrderRequest.java)

[//]: # (│   │   │               │   │       └── OrderResponse.java)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   ├── payment/                   # 💳 Payments)

[//]: # (│   │   │               │   │   ├── controller/)

[//]: # (│   │   │               │   │   │   └── PaymentController.java)

[//]: # (│   │   │               │   │   ├── service/)

[//]: # (│   │   │               │   │   │   └── PaymentService.java)

[//]: # (│   │   │               │   │   ├── repository/)

[//]: # (│   │   │               │   │   │   └── PaymentRepository.java)

[//]: # (│   │   │               │   │   ├── model/)

[//]: # (│   │   │               │   │   │   ├── Payment.java)

[//]: # (│   │   │               │   │   │   └── TransactionLog.java)

[//]: # (│   │   │               │   │   └── dto/)

[//]: # (│   │   │               │   │       └── PaymentRequest.java)

[//]: # (│   │   │               │)

[//]: # (│   │   │               │   └── admin/                     # 🧑‍💼 Admin Dashboard)

[//]: # (│   │   │               │       ├── controller/)

[//]: # (│   │   │               │       │   └── AdminController.java)

[//]: # (│   │   │               │       ├── service/)

[//]: # (│   │   │               │       │   └── AdminService.java)

[//]: # (│   │   │               │       ├── dto/)

[//]: # (│   │   │               │       │   └── AdminDashboardResponse.java)

[//]: # (│   │   │               │       └── model/)

[//]: # (│   │   │               │           └── AdminMetrics.java)

[//]: # (│   │   │)

[//]: # (│   │   ├── resources/)

[//]: # (│   │   │   ├── application.yml                # App configuration)

[//]: # (│   │   │   ├── application-dev.yml            # Dev environment)

[//]: # (│   │   │   ├── application-prod.yml           # Prod environment)

[//]: # (│   │   │   ├── static/                        # Optional frontend assets)

[//]: # (│   │   │   ├── templates/                     # Thymeleaf templates &#40;optional&#41;)

[//]: # (│   │   │   └── db/)

[//]: # (│   │   │       └── migration/                 # Flyway migration scripts)

[//]: # (│   │   │           ├── V1__create_users.sql)

[//]: # (│   │   │           ├── V2__create_products.sql)

[//]: # (│   │   │           ├── V3__create_orders.sql)

[//]: # (│   │   │           └── V4__create_payments.sql)

[//]: # (│   │   │)

[//]: # (│   │   └── webapp/                            # For JSP or embedded UI &#40;optional&#41;)

[//]: # (│   │)

[//]: # (│   └── test/                                  # 🧪 Unit & integration tests)

[//]: # (│       └── java/)

[//]: # (│           └── com/smartbiz/sakhistore/)

[//]: # (│               ├── AuthControllerTest.java)

[//]: # (│               ├── ProductServiceTest.java)

[//]: # (│               ├── OrderServiceTest.java)

[//]: # (│               ├── IntegrationTests.java)

[//]: # (│               └── RepositoryTests.java)

[//]: # (│)

[//]: # (└── target/                                    # 🏗️ Build output &#40;generated by Maven&#41;)


























































src/main/java/com/smartbiz/sakhistore/
│
├── SakhiStoreApplication.java
│
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── SwaggerConfig.java
│   ├── AppProperties.java
│   ├── TenantResolver.java
│   ├── TenantInterceptor.java
│   ├── CloudinaryConfig.java
│   ├── PaymentGatewayConfig.java
│   └── ShippingApiConfig.java
│
├── common/
│   ├── constants/
│   ├── enums/
│   ├── exceptions/
│   │     ├── GlobalExceptionHandler.java
│   │     ├── ResourceNotFoundException.java
│   │     ├── ValidationException.java
│   │     └── SakhiException.java
│   ├── dto/
│   ├── utils/
│   └── response/
│        ├── ApiResponse.java
│        ├── PaginationResponse.java
│        └── ErrorResponse.java
│
├── tenancy/
│   ├── context/
│   ├── filter/
│   ├── resolver/
│   └── annotation/
│
├── modules/
│   ├── auth/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── seller/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── store/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── product/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── category/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── collection/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── inventory/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── order/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── dto/
│   │     ├── model/
│   │     └── repository/
│   │
│   ├── payment/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── model/
│   │     ├── dto/
│   │     └── repository/
│   │
│   ├── shipping/
│   │     ├── controller/
│   │     ├── service/
│   │     ├── model/
│   │     ├── integration/   <-- Shiprocket/Delhivery APIs
│   │     └── repository/
│   │
│   └── admin/
│        ├── controller/
│        ├── service/
│        ├── dto/
│        ├── model/
│        └── repository/
│
├── publicstore/
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── model/
│   └── repository/
│
└── resources/
├── application.properties
├── static/
├── templates/
└── messages.properties
