// ====== UNIFIED APP.JS - All functionality in one file ======
(function() {
  'use strict';

  // ====== PRODUCT DATA ======
  const products = {
    "Casual Wear": [
      { name: "Casual Shirt", image: "../assets/products/cs.jpg", price: 29, color: "Blue", size: "M" },
      { name: "Relaxed Polo", image: "../assets/products/cs.jpg", price: 35, color: "White", size: "L" }
    ],
    "T-Shirts": [
      { name: "Graphic Tee", image: "../assets/genz/ts.webp", price: 19, color: "Black", size: "S" },
      { name: "Plain T-Shirt", image: "../assets/genz/ts.webp", price: 15, color: "White", size: "M" }
    ],
    "Jeans": [
      { name: "Slim Fit Jeans", image: "../assets/genz/Bg.jpg", price: 40, color: "Blue", size: "L" },
      { name: "Distressed Jeans", image: "../assets/genz/Bg.jpg", price: 45, color: "Black", size: "XL" }
    ],
    "Hoodies": [
      { name: "Pullover Hoodie", image: "../assets/genz/hd.webp", price: 50, color: "Grey", size: "M" },
      { name: "Zip Hoodie", image: "../assets/genz/hd.webp", price: 55, color: "Black", size: "L" }
    ],
    "Lowers & Joggers": [
      { name: "Cotton Joggers", image: "../assets/genz/ls.webp", price: 30, color: "Grey", size: "M" },
      { name: "Track Pants", image: "../assets/genz/ls.webp", price: 28, color: "Black", size: "S" }
    ],
    "Co-ord Sets": [
      { name: "Summer Co-ord", image: "../assets/genz/cd.webp", price: 60, color: "White", size: "L" },
      { name: "Winter Co-ord", image: "../assets/genz/cd.webp", price: 70, color: "Black", size: "XL" }
    ]
  };

    // API base URL - set from HTML before loading this script, e.g.:
    // <script>window.API_BASE = 'http://localhost:8080';</script>
    const API_BASE = window.API_BASE || '';

  // ====== CART UTILITIES ======
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      console.error('Error reading cart:', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      return true;
    } catch (e) {
      console.error('Error saving cart:', e);
      return false;
    }
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update all cart count elements
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    cartCountElements.forEach(el => {
      if (el) {
        el.textContent = totalItems;
        if (totalItems > 0) {
          el.style.display = 'inline-block';
        } else {
          el.style.display = 'none';
        }
      }
    });
    
    return totalItems;
  }

  // ====== WISHLIST UTILITIES ======
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch (e) {
      console.error('Error reading wishlist:', e);
      return [];
    }
  }

  function saveWishlist(wishlist) {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      updateWishlistCount();
      return true;
    } catch (e) {
      console.error('Error saving wishlist:', e);
      return false;
    }
  }

  function updateWishlistCount() {
    const wishlist = getWishlist();
    const totalItems = wishlist.length;
    
    // Update all wishlist count elements
    const wishlistCountElements = document.querySelectorAll('#wishlistCount, .wishlist-count');
    wishlistCountElements.forEach(el => {
      if (el) {
        el.textContent = totalItems;
        if (totalItems > 0) {
          el.style.display = 'inline-block';
        } else {
          el.style.display = 'none';
        }
      }
    });
    
    return totalItems;
  }

  function addItemToWishlist(item) {
    const wishlist = getWishlist();
    
    // Create unique ID if not provided
    if (!item.id) {
      item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
    }
    
    // Check if item already exists
    const existingIndex = wishlist.findIndex(wishlistItem => 
      wishlistItem.id === item.id ||
      (wishlistItem.name === item.name && 
       wishlistItem.size === (item.size || 'default') &&
       (wishlistItem.color || 'default') === (item.color || 'default'))
    );
    
    if (existingIndex === -1) {
      // Add new item
      wishlist.push({
        ...item,
        addedAt: new Date().toISOString()
      });
      saveWishlist(wishlist);
      return true;
    }
    
    return false; // Item already in wishlist
  }

  function removeItemFromWishlist(itemIdOrName) {
    const wishlist = getWishlist();
    // Try to find by ID first, then by name if ID doesn't match
    const filtered = wishlist.filter(item => {
      // Check if item has an ID and it matches
      if (item.id && item.id === itemIdOrName) {
        return false; // Remove this item
      }
      // Check if name matches (for backward compatibility)
      if (item.name === itemIdOrName) {
        return false; // Remove this item
      }
      // Keep this item
      return true;
    });
    saveWishlist(filtered);
    return filtered.length < wishlist.length;
  }

  function isItemInWishlist(itemId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === itemId);
  }

  function addItemToCart(item) {
    const cart = getCart();
    
    // Create unique ID if not provided
    if (!item.id) {
      item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
    }
    
    // Check if item already exists (same name, size, color)
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.name === item.name && 
      cartItem.size === (item.size || 'default') &&
      (cartItem.color || 'default') === (item.color || 'default')
    );
    
    if (existingIndex !== -1) {
      // Update quantity
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (item.quantity || 1);
    } else {
      // Add new item
      cart.push({
        ...item,
        quantity: item.quantity || 1
      });
    }
    
    saveCart(cart);
    return cart;
  }

  function removeItemFromCart(itemId) {
    const cart = getCart();
    const filtered = cart.filter(item => item.id !== itemId);
    saveCart(filtered);
    return filtered;
  }

  function updateItemQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        return removeItemFromCart(itemId);
      }
      item.quantity = quantity;
      saveCart(cart);
    }
    
    return cart;
  }

  function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
  }

  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
  }

  function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  // ====== THEME TOGGLE ======
  let themeToggleHandler = null;
  
  // Apply theme immediately on page load (before toggle is found)
  function applyThemeImmediately() {
    const body = document.body;
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    // Default to light mode if no theme is saved
    const isDark = savedTheme === "dark";
    
    // Always remove dark-mode classes first to ensure clean state
    html.classList.remove("dark-mode");
    body.classList.remove("dark-mode");
    
    if (isDark) {
      html.classList.add("dark-mode");
      body.classList.add("dark-mode");
    }
    // If light mode, classes are already removed above
    
    applyDarkModeStyles(isDark);
  }
  
  function initTheme() {
    const darkModeSwitch = document.getElementById("dark-mode-switch");
    
    // If toggle not found, retry after a short delay
    if (!darkModeSwitch) {
      setTimeout(initTheme, 100);
      return;
    }
    
    const body = document.body;
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    // Default to light mode if no theme is saved
    const isDark = savedTheme === "dark";
    
    // Always remove dark-mode classes first to ensure clean state
    html.classList.remove("dark-mode");
    body.classList.remove("dark-mode");
    
    // Then apply dark mode if needed
    if (isDark) {
      html.classList.add("dark-mode");
      body.classList.add("dark-mode");
    }
    
    // Set toggle state to match theme
    darkModeSwitch.checked = isDark;
    
    // Apply additional dark mode styles
    applyDarkModeStyles(isDark);

    // Remove previous event listener if it exists
    if (themeToggleHandler) {
      darkModeSwitch.removeEventListener("change", themeToggleHandler);
    }
    
    // Create new event handler
    themeToggleHandler = function(e) {
      const isDarkMode = e.target.checked;
      const body = document.body;
      const html = document.documentElement;
      
      if (isDarkMode) {
        // Enable dark mode
        html.classList.add("dark-mode");
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
        applyDarkModeStyles(true);
      } else {
        // Enable light mode - explicitly remove dark mode
        html.classList.remove("dark-mode");
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
        
        // Force light mode by clearing inline styles
        html.style.backgroundColor = "";
        body.style.backgroundColor = "";
        html.style.color = "";
        body.style.color = "";
        
        // Force a reflow to ensure styles are applied
        void html.offsetHeight;
        void body.offsetHeight;
        
        // Apply light mode styles
        applyDarkModeStyles(false);
        
        // Trigger a style recalculation
        window.getComputedStyle(html);
        window.getComputedStyle(body);
      }
    };
    
    // Add event listener
    darkModeSwitch.addEventListener("change", themeToggleHandler);
  }
  
  // Apply theme immediately (runs as soon as script loads)
  applyThemeImmediately();
  
  // Initialize theme toggle when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  function applyDarkModeStyles(isDark) {
    // Hero cards
    document.querySelectorAll(".hero-card").forEach(card => {
      if (isDark) {
        card.style.background = "rgba(30,30,30,0.6)";
        card.style.color = "#f5f5f5";
      } else {
        card.style.background = "rgba(255,255,255,0.6)";
        card.style.color = "#333";
      }
    });

    // Carousel buttons
    document.querySelectorAll(".carousel-btn").forEach(btn => {
      if (isDark) {
        btn.style.background = "#444";
      } else {
        btn.style.background = "#2b2b2b";
      }
      btn.style.color = "#fff";
    });

    // Modals
    document.querySelectorAll(".modal-content").forEach(modal => {
      if (isDark) {
        modal.style.background = "#1e1e1e";
        modal.style.color = "#e1e1e1";
      } else {
        modal.style.background = "#fff";
        modal.style.color = "#222";
      }
    });
    
    // Force style recalculation for light mode
    if (!isDark) {
      // Trigger a reflow to ensure CSS variables are recalculated
      document.body.offsetHeight;
    }
  }

  // ====== MOBILE MENU ======
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNav");

    if (mobileMenuBtn && mobileNav) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("active");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
          mobileNav.classList.remove("active");
        }
      });

      // Close menu when clicking a nav item
      mobileNav.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
          mobileNav.classList.remove("active");
        });
      });
    }
  }

  // ====== CAROUSEL LOGIC ======
  function initCarousel() {
    const carouselTrack = document.getElementById("carouselTrack");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const carouselElement = document.querySelector(".carousel");
    const items = document.querySelectorAll(".carousel-item");

    if (!carouselTrack || !carouselElement || items.length === 0) return;

    let currentIndex = 0;
    const itemWidth = 280; // Width + gap
    let visibleItems = Math.floor(carouselElement.offsetWidth / itemWidth);

    window.addEventListener("resize", () => {
      visibleItems = Math.floor(carouselElement.offsetWidth / itemWidth);
      updateCarousel();
    });

    function updateCarousel() {
      carouselTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    let autoScroll = setInterval(() => {
      currentIndex = (currentIndex < items.length - visibleItems) ? currentIndex + 1 : 0;
      updateCarousel();
    }, 4000);

    carouselElement.addEventListener("mouseenter", () => clearInterval(autoScroll));
    carouselElement.addEventListener("mouseleave", () => {
      autoScroll = setInterval(() => {
        currentIndex = (currentIndex < items.length - visibleItems) ? currentIndex + 1 : 0;
        updateCarousel();
      }, 4000);
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < items.length - visibleItems) currentIndex++;
        updateCarousel();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) currentIndex--;
        updateCarousel();
      });
    }
  }

  // ====== CATEGORY PAGE FUNCTIONALITY ======
  function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("name");
    return raw ? raw.trim() : "";
  }

  function getCategoryIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("categoryId");
  }

  function getFilters() {
    const colorFilter = document.getElementById("colorFilter");
    const sizeFilter = document.getElementById("sizeFilter");
    const sortSelect = document.getElementById("sortSelect");
    
    return {
      color: colorFilter ? colorFilter.value : "all",
      size: sizeFilter ? sizeFilter.value : "all",
      sort: sortSelect ? sortSelect.value : "default"
    };
  }

  async function filterAndDisplayProducts() {
    const category = decodeURIComponent(getCategoryFromURL() || "");
    const categoryId = getCategoryIdFromURL();
    const title = document.getElementById("category-title");
    const grid = document.getElementById("product-grid");
    const cartContainer = document.getElementById('cart-container');

    if (!category) {
      if (grid) grid.innerHTML = "<p>No category specified.</p>";
      return;
    }

    if (title) title.textContent = category;

    // Get store slug from URL for filtering
    const params = new URLSearchParams(window.location.search);
    const storeSlug = params.get('store');
    if (storeSlug) {
      window.currentStoreSlug = storeSlug;
    }

    // Try fetching from backend API. If backend fails, fallback to local products object.
    let fetched = [];
    try {
      // If store slug is present, use store-specific product endpoint
      if (storeSlug && window.API && window.API.getStoreProductsBySlug) {
        try {
          fetched = await window.API.getStoreProductsBySlug(storeSlug, category);
          if (Array.isArray(fetched) && fetched.length > 0) {
            // If categoryId is provided, filter by id first
            if (categoryId) {
              fetched = fetched.filter(p => {
                const pid = p.categoryId || p.category_id || p.category?.category_id || p.category?.id;
                return pid && String(pid) === String(categoryId);
              });
            } else if (category) {
              // Otherwise filter by category name
              const categoryLower = category.toLowerCase();
              fetched = fetched.filter(p => {
                const productCategory = (p.productCategory || '').toLowerCase();
                const businessCategory = (p.businessCategory || '').toLowerCase();
                const catName = (p.category?.categoryName || '').toLowerCase();
                return productCategory.includes(categoryLower) || 
                       businessCategory.includes(categoryLower) ||
                       catName.includes(categoryLower);
              });
            }
          }
        } catch (e) {
          console.warn('Store products fetch failed, trying category API:', e);
        }
      }
      
      // Fallback to category API
      if ((!fetched || fetched.length === 0) && typeof fetchProductsByCategory === 'function') {
        fetched = await fetchProductsByCategory(category);
        if (categoryId && fetched && fetched.length > 0) {
          fetched = fetched.filter(p => {
            const pid = p.categoryId || p.category_id || p.category?.category_id || p.category?.id;
            return pid && String(pid) === String(categoryId);
          });
        }
      }
    } catch (e) {
      console.warn('Error fetching products by category, falling back to local:', e);
      fetched = null;
    }

    // Normalize source: backend may return array or { products: [...] }
    if (!fetched) {
      fetched = products[category] ? [...products[category]] : [];
    }

    fetched = (fetched || []).map(p => ({
      name: p.productName || p.title || p.name || p.name,
      image: p.productImages?.[0] || p.image || p.imageUrl || p.socialSharingImage || "../assets/products/p1.jpg",
      price: p.sellingPrice ?? p.price ?? p.amount ?? 0,
      color: p.color || p.colour || p.variantColor || 'N/A',
      size: p.size || p.availableSize || 'N/A',
      categoryId: p.categoryId || p.category_id || p.category?.category_id || p.category?.id,
      raw: p
    }));

    const { color, size, sort } = getFilters();
    let filtered = fetched;

    if (color && color !== "all") filtered = filtered.filter(p => String(p.color).toLowerCase() === String(color).toLowerCase());
    if (categoryId) {
      filtered = filtered.filter(p => p.categoryId && String(p.categoryId) === String(categoryId));
    }
    if (size && size !== "all") filtered = filtered.filter(p => String(p.size).toLowerCase() === String(size).toLowerCase());

    if (sort === "lowToHigh") filtered.sort((a,b) => a.price - b.price);
    else if (sort === "highToLow") filtered.sort((a,b) => b.price - a.price);

    if (!filtered || filtered.length === 0) {
      if (grid) grid.innerHTML = "<p>No matching products found.</p>";
      return;
    }

    window.filtered = filtered; // for add-to-cart
    if (grid) {
      grid.innerHTML = filtered.map((product, index) => `
        <div class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <h4>${product.name}</h4>
          <p>₹${Number(product.price).toFixed(2)}</p>
          <button class="add-to-cart-btn" data-index="${index}">Add to Cart</button>
        </div>
      `).join("");
      setupAddToCartButtons();
    }
  }

  function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        const product = window.filtered && window.filtered[index];
        if (product) {
          addItemToCart(product);
          if (window.showToast) {
            showToast(`${product.name} added to cart!`, 'success', 'Added to Cart');
          } else {
            alert(`${product.name} added to cart!`);
          }
        }
      });
    });
  }

  function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const cart = getCart();

    if (!cartContainer) return;

    if (cart.length === 0) {
      cartContainer.innerHTML = '<p>Your cart is empty.</p>';
      updateCartCount();
      return;
    }

    cartContainer.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-index="${index}" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; padding:5px; border:1px solid #ccc; border-radius:5px;">
        <div>
          <strong>${item.name}</strong> - $${item.price} x ${item.quantity || 1}
        </div>
        <button class="delete-btn" data-index="${index}" style="background:#ff4d4f; border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
      </div>
    `).join("");

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        deleteCartItem(Number(idx));
      });
    });

    updateCartCount();
  }

  function deleteCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  // ====== API HELPERS & STORE PAGE LOADER ======
  // Generic fetch helper that respects window.API_BASE if set
  async function fetchJson(path, opts = {}) {
    const base = API_BASE || window.location.origin;
    const url = path.startsWith('http') ? path : base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
    try {
      const res = await fetch(url, opts);
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ' - ' + txt : ''}`);
      }
      return await res.json().catch(() => null);
    } catch (err) {
      console.warn('fetchJson error:', err, url);
      throw err;
    }
  }

  // Try several common backend endpoints to fetch products for a category
  async function fetchProductsByCategory(category) {
    if (!category) return [];
    
    // Use API integration if available
    if (window.API && window.API.getProductsByCategory) {
      try {
        const result = await window.API.getProductsByCategory(category);
        if (Array.isArray(result) && result.length > 0) {
          return result;
        }
      } catch (e) {
        console.warn('API.getProductsByCategory failed, trying fallback:', e);
      }
    }
    
    // Fallback: Try direct API calls
    const encoded = encodeURIComponent(category);
    const candidates = [
      `/api/products?category=${encoded}`,
      `/api/categories/${encoded}/products`,
      `/api/products/category/${encoded}`
    ];

    for (const p of candidates) {
      try {
        const resp = await fetchJson(p);
        if (!resp) continue;
        if (Array.isArray(resp)) return resp;
        if (resp.products) return resp.products;
        if (resp.data) return resp.data;
      } catch (e) {
        // try next
      }
    }

    // Final fallback to local `products` object
    return products[category] ? [...products[category]] : [];
  }

  // Load store page: fetch store metadata and the seller's products
  async function loadStorePage() {
    const container = document.getElementById('store-page');
    if (!container) return; // not a store page

    const nameEl = document.getElementById('store-name');
    const descEl = document.getElementById('store-description');
    const linkEl = document.getElementById('store-link');
    const logoEl = document.getElementById('store-logo');
    const grid = document.getElementById('store-products-grid');

    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('sellerId');
    const storeId = params.get('storeId');
    const slug = params.get('slug');

    let store = null;
    try {
      // Use API integration if available
      if (window.API) {
        if (storeId && window.API.getStoreById) {
          try { store = await window.API.getStoreById(storeId); } catch(e) { store = null; }
        }
        if (!store && slug && window.API.getStoreBySlug) {
          try { store = await window.API.getStoreBySlug(slug); } catch(e) { store = null; }
        }
        if (!store && sellerId && window.API.getStoreBySellerId) {
          try { store = await window.API.getStoreBySellerId(sellerId); } catch(e) { store = null; }
        }
      }
      
      // Fallback to direct API calls
      if (!store && storeId) {
        try { store = await fetchJson(`/api/stores/${encodeURIComponent(storeId)}`); } catch(e) { store = null; }
      }
      if (!store && slug) {
        try { store = await fetchJson(`/api/stores/slug/${encodeURIComponent(slug)}`); } catch(e) { store = null; }
      }
      if (!store && sellerId) {
        try { store = await fetchJson(`/api/stores?sellerId=${encodeURIComponent(sellerId)}`); } catch(e) { store = null; }
        if (!store) {
          try { store = await fetchJson(`/api/stores/seller?sellerId=${encodeURIComponent(sellerId)}`); } catch(e) { store = null; }
        }
      }

      if (store) {
        const storeName = store.storeName || store.name || store.shopName || 'Store';
        const desc = store.businessDetails?.businessDescription || store.description || '';
        const link = store.storeLink || store.website || (store.slug ? `${window.location.origin}/${store.slug}` : '');
        const logo = store.logoUrl || store.logo || '';

        if (nameEl) nameEl.textContent = storeName;
        if (descEl) descEl.textContent = desc;
        if (linkEl && link) { linkEl.href = link; linkEl.textContent = link.replace(/^https?:\/\//,''); linkEl.style.display = 'inline-block'; }
        if (logoEl && logo) { logoEl.src = logo; logoEl.alt = storeName; }
      } else {
        if (nameEl) nameEl.textContent = 'Store';
        if (descEl) descEl.textContent = '';
      }

      const finalSellerId = store?.sellerId || store?.seller?.id || sellerId || store?.id;

      let productsData = [];
      if (finalSellerId) {
        // Use API integration if available
        if (window.API && window.API.getAllProductsBySeller) {
          try {
            const result = await window.API.getAllProductsBySeller(finalSellerId);
            if (Array.isArray(result)) {
              productsData = result;
            } else if (result && Array.isArray(result.products)) {
              productsData = result.products;
            }
          } catch (e) {
            console.warn('API.getAllProductsBySeller failed, trying fallback:', e);
          }
        }
        
        // Fallback: Try direct API calls
        if (productsData.length === 0) {
          const candidates = [
            `/api/products?sellerId=${encodeURIComponent(finalSellerId)}`,
            `/api/products/sellerProducts?sellerId=${encodeURIComponent(finalSellerId)}`,
            `/api/stores/${encodeURIComponent(finalSellerId)}/products`,
            `/api/sellers/${encodeURIComponent(finalSellerId)}/products`
          ];
          for (const c of candidates) {
            try {
              const resp = await fetchJson(c);
              if (!resp) continue;
              if (Array.isArray(resp)) { productsData = resp; break; }
              if (resp.products) { productsData = resp.products; break; }
              if (resp.data) { productsData = resp.data; break; }
            } catch (e) {
              // ignore
            }
          }
        }
      }
      
      // Also try to get products by store slug if we have a slug
      if (productsData.length === 0 && slug && window.API && window.API.getStoreProductsBySlug) {
        try {
          const result = await window.API.getStoreProductsBySlug(slug);
          if (Array.isArray(result) && result.length > 0) {
            productsData = result;
          }
        } catch (e) {
          console.warn('API.getStoreProductsBySlug failed:', e);
        }
      }

      productsData = (productsData || []).map(p => ({
        productName: p.productName || p.title || p.name,
        image: p.productImages?.[0] || p.image || p.imageUrl || '../assets/products/p1.jpg',
        price: p.sellingPrice ?? p.price ?? 0,
        raw: p
      }));

      if (grid) {
        if (!productsData || productsData.length === 0) {
          grid.innerHTML = '<p>No products found for this store.</p>';
        } else {
          grid.innerHTML = productsData.map(p => `
            <div class="product-card">
              <img src="${p.image}" alt="${p.productName}" />
              <h4>${p.productName}</h4>
              <p>₹${Number(p.price).toFixed(2)}</p>
              <button class="add-to-cart-btn" data-name="${p.productName}" data-price="${p.price}">Add to Cart</button>
            </div>
          `).join('');

          grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const name = btn.getAttribute('data-name');
              const price = parseFloat(btn.getAttribute('data-price')) || 0;
              addItemToCart({ name, price, quantity: 1 });
              if (window.showToast) showToast(`${name} added to cart`, 'success');
            });
          });
        }
      }
    } catch (err) {
      console.error('loadStorePage error', err);
      if (grid) grid.innerHTML = `<p class="error">Failed to load store data: ${err.message || err}</p>`;
    }
  }

  // ====== CART MODAL ======
  // Cart modal removed - cart button now directly navigates to cart.html

  // ====== EXPOSE GLOBAL FUNCTIONS ======
  window.CartUtils = {
    getCart,
    saveCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    updateCartCount
  };

  // Helper function to update wishlist button icon (GIF when wishlisted, SVG when not)
  function updateWishlistButtonIcon(button, isWishlisted) {
    if (!button) return;
    
    // Determine the correct path to the GIF based on current page location
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const gifPath = isInPagesFolder ? '../assets/gifs/wishlist.gif' : 'assets/gifs/wishlist.gif';
    const iconSize = button.classList.contains('search-wishlist-btn') ? '18' : '20';
    
    if (isWishlisted) {
      // Replace with GIF
      button.innerHTML = `<img src="${gifPath}" alt="Wishlisted" style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;" />`;
      button.title = 'Remove from Wishlist';
    } else {
      // Replace with SVG
      button.innerHTML = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>`;
      button.title = 'Add to Wishlist';
    }
  }

  // Helper function to check if product is in wishlist by name
  function isProductInWishlistByName(productName) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.name === productName);
  }

  // Initialize wishlist button states for all buttons on page
  function initializeWishlistButtons() {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn, .search-wishlist-btn');
    wishlistButtons.forEach(button => {
      const productName = button.getAttribute('data-name');
      if (productName && isProductInWishlistByName(productName)) {
        updateWishlistButtonIcon(button, true);
      }
    });
  }

  window.WishlistUtils = {
    getWishlist,
    saveWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    isItemInWishlist,
    updateWishlistButtonIcon,
    isProductInWishlistByName,
    initializeWishlistButtons,
    updateWishlistCount
  };

  window.products = products;
  window.filterAndDisplayProducts = filterAndDisplayProducts;
  window.renderCart = renderCart;

  // ====== INITIALIZATION ======
  function init() {
    // Initialize theme
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }

    // Initialize cart count
    updateCartCount();
    setInterval(updateCartCount, 2000); // Update every 2 seconds for multi-tab support

    // Initialize wishlist count
    updateWishlistCount();
    setInterval(updateWishlistCount, 2000); // Update every 2 seconds for multi-tab support

    // Initialize mobile menu
    initMobileMenu();

    // Initialize carousel
    initCarousel();

    // Cart modal removed - cart button navigates directly to cart.html

    // Category page initialization
    const category = getCategoryFromURL();
    if (category) {
      filterAndDisplayProducts();
      renderCart();

      // Filter listeners
      const colorFilter = document.getElementById("colorFilter");
      const sizeFilter = document.getElementById("sizeFilter");
      const sortSelect = document.getElementById("sortSelect");

      if (colorFilter) colorFilter.addEventListener("change", filterAndDisplayProducts);
      if (sizeFilter) sizeFilter.addEventListener("change", filterAndDisplayProducts);
      if (sortSelect) sortSelect.addEventListener("change", filterAndDisplayProducts);
    }

    // Try to load store page if present (will no-op on non-store pages)
    try {
      loadStorePage();
    } catch (e) {
      // ignore
    }
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ====== TOAST NOTIFICATION SYSTEM ======
(function() {
  'use strict';

  // Create toast container if it doesn't exist
  function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // Show toast notification
  function showToast(message, type = 'success', title = null) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons for different toast types
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    };

    const defaultTitles = {
      success: 'Success',
      error: 'Error',
      info: 'Info',
      warning: 'Warning'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.success}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      removeToast(toast);
    }, 5000);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoRemove);
      removeToast(toast);
    });

    // Remove toast function
    function removeToast(toastElement) {
      toastElement.classList.add('hiding');
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, 300);
    }
  }

  // Expose to global scope
  window.showToast = showToast;

  // ====== PROFILE SIDEBAR FUNCTIONS ======
  function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function updateProfileSidebar() {
    const user = getCurrentUser();
    const profileName = document.getElementById('profileName');
    const profilePhone = document.getElementById('profilePhone');
    const sidebarProfileName = document.querySelector('.profile-sidebar-name');
    const sidebarProfilePhone = document.querySelector('.profile-sidebar-phone');

    if (user) {
      if (profileName) profileName.textContent = user.name || 'User';
      if (profilePhone) profilePhone.textContent = user.phone ? `+91 ${user.phone}` : '';
      if (sidebarProfileName) sidebarProfileName.textContent = user.name || 'User';
      if (sidebarProfilePhone) sidebarProfilePhone.textContent = user.phone ? `+91 ${user.phone}` : '';
    } else {
      if (profileName) profileName.textContent = 'Guest User';
      if (profilePhone) profilePhone.textContent = 'Login to view details';
      if (sidebarProfileName) sidebarProfileName.textContent = 'Guest User';
      if (sidebarProfilePhone) sidebarProfilePhone.textContent = 'Login to view details';
    }
  }

  function openProfileSidebar() {
    const profileSidebar = document.getElementById('profileSidebar');
    const profileSidebarOverlay = document.getElementById('profileSidebarOverlay');

    if (profileSidebar) {
      updateProfileSidebar();
      // Highlight active menu item when opening sidebar
      highlightActiveMenuItem();
      profileSidebar.classList.add('active');
      if (profileSidebarOverlay) {
        profileSidebarOverlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProfileSidebar() {
    const profileSidebar = document.getElementById('profileSidebar');
    const profileSidebarOverlay = document.getElementById('profileSidebarOverlay');
    
    if (profileSidebar) {
      profileSidebar.classList.remove('active');
      if (profileSidebarOverlay) {
        profileSidebarOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  }

  // Custom confirm dialog function
  function showConfirmDialog(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('confirmModalOverlay');
      const modalTitle = document.getElementById('confirmModalTitle');
      const modalMessage = document.getElementById('confirmModalMessage');
      const confirmBtn = document.getElementById('confirmModalConfirm');
      const cancelBtn = document.getElementById('confirmModalCancel');

      if (!overlay || !modalTitle || !modalMessage || !confirmBtn || !cancelBtn) {
        // Fallback to browser confirm if modal elements don't exist
        resolve(confirm(message));
        return;
      }

      // Set message and title
      modalTitle.textContent = title;
      modalMessage.textContent = message;

      // Show modal
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Clean up previous listeners
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

      // Handle confirm
      newConfirmBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        resolve(true);
      });

      // Handle cancel
      newCancelBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        resolve(false);
      });

      // Handle overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
          resolve(false);
        }
      });

      // Handle Escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
          document.removeEventListener('keydown', escapeHandler);
          resolve(false);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    });
  }

  function handleSignOut() {
    showConfirmDialog('Are you sure you want to sign out?', 'Sign Out').then((confirmed) => {
      if (confirmed) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        updateProfileSidebar();
        closeProfileSidebar();
        if (window.showToast) {
          showToast('Signed out successfully', 'success', 'Sign Out');
        }
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    });
  }

  // Initialize profile sidebar event listeners
  function initProfileSidebar() {
    const profileSidebar = document.getElementById('profileSidebar');
    const profileSidebarOverlay = document.getElementById('profileSidebarOverlay');
    const profileSidebarClose = document.getElementById('profileSidebarClose');
    const profileBtn = document.getElementById('profileBtn');
    const sidebarLightModeBtn = document.getElementById('sidebarLightMode');

    // Open sidebar when clicking profile button
    // Use event delegation as backup to ensure it always works
    if (profileBtn) {
      // Remove any existing listeners by cloning
      const newBtn = profileBtn.cloneNode(true);
      profileBtn.parentNode.replaceChild(newBtn, profileBtn);
      
      // Add click listener
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (typeof openProfileSidebar === 'function') {
          openProfileSidebar();
        }
      });
    }
    
    // Also use event delegation on document as ultimate fallback
    document.addEventListener('click', function(e) {
      if (e.target && (e.target.id === 'profileBtn' || e.target.closest('#profileBtn'))) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openProfileSidebar === 'function') {
          openProfileSidebar();
        }
      }
    }, true);

    // Close sidebar
    if (profileSidebarClose) {
      profileSidebarClose.addEventListener('click', () => {
        closeProfileSidebar();
      });
    }

    // Close sidebar when clicking overlay
    if (profileSidebarOverlay) {
      profileSidebarOverlay.addEventListener('click', () => {
        closeProfileSidebar();
      });
    }

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileSidebar && profileSidebar.classList.contains('active')) {
        closeProfileSidebar();
      }
    });

    // Light Mode toggle from sidebar
    if (sidebarLightModeBtn) {
      sidebarLightModeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const darkModeSwitch = document.getElementById('dark-mode-switch');
        if (darkModeSwitch) {
          darkModeSwitch.checked = !darkModeSwitch.checked;
          darkModeSwitch.dispatchEvent(new Event('change'));
        }
      });
    }

    // Close sidebar when clicking menu items (except light mode toggle and sign out)
    const sidebarMenuItems = document.querySelectorAll('.profile-sidebar-item');
    sidebarMenuItems.forEach(item => {
      if (item.id !== 'sidebarLightMode' && item.id !== 'sidebarSignOut') {
        item.addEventListener('click', () => {
          setTimeout(() => {
            closeProfileSidebar();
          }, 100);
        });
      }
    });

    // Update profile sidebar on load
    updateProfileSidebar();
    
    // Highlight active menu item based on current page
    highlightActiveMenuItem();
    
    // Use MutationObserver to re-highlight when sidebar becomes active
    if (profileSidebar) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (profileSidebar.classList.contains('active')) {
              // Sidebar just opened, highlight active item
              setTimeout(() => {
                highlightActiveMenuItem();
              }, 50);
            }
          }
        });
      });
      
      observer.observe(profileSidebar, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }
  
  // Function to highlight active menu item
  function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    const currentPage = currentPath.split('/').pop() || currentPath.split('\\').pop() || '';
    
    // Remove active class from all items
    const allItems = document.querySelectorAll('.profile-sidebar-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    // Check multiple ways to determine current page
    const isWishlist = currentPage.toLowerCase().includes('wishlist') || 
                       currentPath.toLowerCase().includes('wishlist') || 
                       currentHref.toLowerCase().includes('wishlist');
    const isOrders = currentPage.toLowerCase().includes('orders') || 
                     currentPath.toLowerCase().includes('orders') || 
                     currentHref.toLowerCase().includes('orders');
    const isCart = currentPage.toLowerCase().includes('cart') || 
                   currentPath.toLowerCase().includes('cart') || 
                   currentHref.toLowerCase().includes('/cart');
    const isOrderTracking = currentPage.toLowerCase().includes('order-tracking') || 
                           currentPath.toLowerCase().includes('order-tracking') || 
                           currentHref.toLowerCase().includes('order-tracking');
    const isFAQ = currentPage.toLowerCase().includes('faq') || 
                  currentPath.toLowerCase().includes('faq') || 
                  currentHref.toLowerCase().includes('faq');
    
    // Add active class based on current page
    if (isWishlist) {
      const wishlistItem = document.getElementById('sidebarWishlist');
      if (wishlistItem) {
        wishlistItem.classList.add('active');
      }
    } else if (isOrders) {
      const ordersItem = document.getElementById('sidebarMyOrders');
      if (ordersItem) {
        ordersItem.classList.add('active');
      }
    } else if (isCart) {
      const cartItem = document.getElementById('sidebarCart');
      if (cartItem) {
        cartItem.classList.add('active');
      }
    } else if (isOrderTracking) {
      const trackItem = document.getElementById('sidebarTrackOrder');
      if (trackItem) {
        trackItem.classList.add('active');
      }
    } else if (isFAQ) {
      const faqItem = document.getElementById('sidebarFAQ');
      if (faqItem) {
        faqItem.classList.add('active');
      }
    }
  }

  // Expose profile sidebar functions to global scope IMMEDIATELY
  // This ensures onclick handlers work even before full initialization
  window.openProfileSidebar = openProfileSidebar;
  window.closeProfileSidebar = closeProfileSidebar;
  window.handleSignOut = handleSignOut;
  window.updateProfileSidebar = updateProfileSidebar;
  window.getCurrentUser = getCurrentUser;
  window.initProfileSidebar = initProfileSidebar;
  window.highlightActiveMenuItem = highlightActiveMenuItem;
  window.showConfirmDialog = showConfirmDialog;

  // Hide floating login button on all pages except home page (index.html)
  function hideFloatingLoginButton() {
    // Check if we're on the home page
    const isHomePage = document.body.classList.contains('home-page') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.includes('index.html');
    
    const floatingBtn = document.getElementById('floatingLoginBtn');
    if (floatingBtn && !isHomePage) {
      floatingBtn.style.display = 'none';
      floatingBtn.style.visibility = 'hidden';
      floatingBtn.style.opacity = '0';
      floatingBtn.style.pointerEvents = 'none';
      floatingBtn.remove(); // Remove from DOM entirely
    }
  }

  // Hide floating button immediately and after DOM loads
  hideFloatingLoginButton();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hideFloatingLoginButton, 100);
      setTimeout(hideFloatingLoginButton, 500);
    });
  } else {
    setTimeout(hideFloatingLoginButton, 100);
    setTimeout(hideFloatingLoginButton, 500);
  }

  // Initialize profile sidebar multiple times to catch header loading
  function tryInitProfileSidebar() {
    const profileBtn = document.getElementById('profileBtn');
    const profileSidebar = document.getElementById('profileSidebar');
    
    // Only initialize if elements exist
    if (profileBtn || profileSidebar) {
      initProfileSidebar();
    }
  }

  // Try immediately
  tryInitProfileSidebar();
  
  // Highlight active item on page load
  setTimeout(() => {
    if (typeof window.highlightActiveMenuItem === 'function') {
      window.highlightActiveMenuItem();
    }
  }, 100);
  setTimeout(() => {
    if (typeof window.highlightActiveMenuItem === 'function') {
      window.highlightActiveMenuItem();
    }
  }, 500);
  setTimeout(() => {
    if (typeof window.highlightActiveMenuItem === 'function') {
      window.highlightActiveMenuItem();
    }
  }, 1000);

  // Try when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryInitProfileSidebar, 100);
      setTimeout(tryInitProfileSidebar, 500);
      setTimeout(tryInitProfileSidebar, 1000);
      // Also highlight active item
      setTimeout(() => {
        if (typeof window.highlightActiveMenuItem === 'function') {
          window.highlightActiveMenuItem();
        }
      }, 150);
      setTimeout(() => {
        if (typeof window.highlightActiveMenuItem === 'function') {
          window.highlightActiveMenuItem();
        }
      }, 600);
      setTimeout(() => {
        if (typeof window.highlightActiveMenuItem === 'function') {
          window.highlightActiveMenuItem();
        }
      }, 1100);
    });
  } else {
    setTimeout(tryInitProfileSidebar, 100);
    setTimeout(tryInitProfileSidebar, 500);
    setTimeout(tryInitProfileSidebar, 1000);
  }

  // Also listen for when header component loads
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const profileBtn = node.querySelector ? node.querySelector('#profileBtn') : null;
            const profileSidebar = node.querySelector ? node.querySelector('#profileSidebar') : null;
            if (profileBtn || profileSidebar) {
              setTimeout(tryInitProfileSidebar, 50);
            }
          }
        });
      }
    });
  });

  // Observe header placeholder for changes
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    observer.observe(headerPlaceholder, { childList: true, subtree: true });
  }

  // Disable login modal on all pages except index.html and login.html
  function disableLoginModalOnOtherPages() {
    const isIndexPage = window.location.pathname === '/' || 
                        window.location.pathname.endsWith('index.html') ||
                        window.location.pathname.endsWith('/') ||
                        window.location.href.includes('index.html');
    
    const isLoginPage = window.location.pathname.includes('login.html') ||
                        window.location.href.includes('login.html');
    
    if (!isIndexPage && !isLoginPage) {
      const loginModalOverlay = document.getElementById('loginModalOverlay');
      const loginModal = document.getElementById('loginModal');
      const otpForm = document.getElementById('otpForm');
      const otpFormContainer = document.getElementById('otpFormContainer');
      
      if (loginModalOverlay) {
        // Hide the login modal completely
        loginModalOverlay.style.display = 'none';
        loginModalOverlay.style.visibility = 'hidden';
        loginModalOverlay.style.opacity = '0';
        loginModalOverlay.style.pointerEvents = 'none';
        loginModalOverlay.classList.remove('active');
        
        // Disable any onclick handlers
        loginModalOverlay.onclick = null;
        
        // Prevent modal from being opened
        loginModalOverlay.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }, true);
      }
      
      if (loginModal) {
        loginModal.style.display = 'none';
        loginModal.style.visibility = 'hidden';
        loginModal.style.pointerEvents = 'none';
      }
      
      if (otpForm) {
        otpForm.onsubmit = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        };
        
        // Disable all inputs in the form
        const inputs = otpForm.querySelectorAll('input, button');
        inputs.forEach(input => {
          input.disabled = true;
          input.style.pointerEvents = 'none';
        });
      }
      
      if (otpFormContainer) {
        otpFormContainer.style.display = 'none';
        otpFormContainer.style.pointerEvents = 'none';
      }
      
      // Override openLoginModal if it exists
      if (typeof window.openLoginModal === 'function') {
        const originalOpenLoginModal = window.openLoginModal;
        window.openLoginModal = function() {
          // Do nothing - login only works on index page
          console.log('Login is only available on the home page');
          return false;
        };
      }
    }
  }

  // Disable login modal immediately and after header loads
  disableLoginModalOnOtherPages();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(disableLoginModalOnOtherPages, 100);
      setTimeout(disableLoginModalOnOtherPages, 500);
    });
  } else {
    setTimeout(disableLoginModalOnOtherPages, 100);
    setTimeout(disableLoginModalOnOtherPages, 500);
  }

  // Also disable when header loads
  if (headerPlaceholder) {
    const headerObserver = new MutationObserver(() => {
      setTimeout(disableLoginModalOnOtherPages, 100);
    });
    headerObserver.observe(headerPlaceholder, { childList: true, subtree: true });
  }
})();

// ====== BANNER CAROUSEL FUNCTIONALITY ======
(function() {
  'use strict';

  function initBannerCarousel() {
    let currentBannerSlide = 0;
    const bannerSlides = document.querySelectorAll('.banner-slide');
    const bannerIndicators = document.querySelectorAll('.banner-indicator');
    const bannerPrevBtn = document.getElementById('bannerPrevBtn');
    const bannerNextBtn = document.getElementById('bannerNextBtn');
    let bannerAutoPlayInterval;

    if (bannerSlides.length === 0) {
      console.log('Banner slides not found - retrying...');
      setTimeout(initBannerCarousel, 100);
      return;
    }

    console.log('Banner carousel initialized with', bannerSlides.length, 'slides');

    function showBannerSlide(index) {
      if (index < 0 || index >= bannerSlides.length) return;
      
      // Remove active class from all slides and indicators
      bannerSlides.forEach(slide => slide.classList.remove('active'));
      bannerIndicators.forEach(indicator => indicator.classList.remove('active'));

      // Add active class to current slide and indicator
      if (bannerSlides[index]) {
        bannerSlides[index].classList.add('active');
      }
      if (bannerIndicators[index]) {
        bannerIndicators[index].classList.add('active');
      }
    }

    function nextBannerSlide() {
      currentBannerSlide = (currentBannerSlide + 1) % bannerSlides.length;
      showBannerSlide(currentBannerSlide);
    }

    function prevBannerSlide() {
      currentBannerSlide = (currentBannerSlide - 1 + bannerSlides.length) % bannerSlides.length;
      showBannerSlide(currentBannerSlide);
    }

    function goToBannerSlide(index) {
      currentBannerSlide = index;
      showBannerSlide(currentBannerSlide);
      resetBannerAutoPlay();
    }

    function startBannerAutoPlay() {
      bannerAutoPlayInterval = setInterval(nextBannerSlide, 5000); // Change slide every 5 seconds
    }

    function stopBannerAutoPlay() {
      if (bannerAutoPlayInterval) {
        clearInterval(bannerAutoPlayInterval);
      }
    }

    function resetBannerAutoPlay() {
      stopBannerAutoPlay();
      startBannerAutoPlay();
    }

    // Event listeners
    if (bannerNextBtn) {
      bannerNextBtn.addEventListener('click', () => {
        nextBannerSlide();
        resetBannerAutoPlay();
      });
    }

    if (bannerPrevBtn) {
      bannerPrevBtn.addEventListener('click', () => {
        prevBannerSlide();
        resetBannerAutoPlay();
      });
    }

    // Indicator clicks
    bannerIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goToBannerSlide(index);
      });
    });

    // Pause on hover
    const bannerCarouselWrapper = document.querySelector('.banner-carousel-wrapper');
    if (bannerCarouselWrapper) {
      bannerCarouselWrapper.addEventListener('mouseenter', stopBannerAutoPlay);
      bannerCarouselWrapper.addEventListener('mouseleave', startBannerAutoPlay);
    }

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (bannerCarouselWrapper) {
      bannerCarouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });

      bannerCarouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleBannerSwipe();
      });
    }

    function handleBannerSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        nextBannerSlide();
        resetBannerAutoPlay();
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        prevBannerSlide();
        resetBannerAutoPlay();
      }
    }

    // Initialize
    console.log('Initializing banner carousel...');
    showBannerSlide(0);
    setTimeout(() => {
      startBannerAutoPlay();
      console.log('Banner carousel auto-play started');
    }, 1000);
  }

  // Initialize banner carousel when DOM is ready
  function startBannerCarousel() {
    setTimeout(function() {
      initBannerCarousel();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBannerCarousel);
  } else {
    startBannerCarousel();
  }
})();

