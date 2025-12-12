/**
 * Load Header and Footer Components
 * This script dynamically loads header.html and footer.html into pages
 */

// Helper: get store slug from current URL
function getCurrentStoreSlug() {
  try {
    const params = new URLSearchParams(window.location.search);
    const store = params.get('store');
    return store ? store.trim() : null;
  } catch (e) {
    return null;
  }
}

// Function to append store param to navigation links so cross-page navigation preserves store context
function appendStoreParamToLinks(rootEl, storeSlug) {
  if (!rootEl || !storeSlug) return;
  
  // Get all links that should preserve store context
  const selectors = [
    'a[href*="index.html"]',
    'a[href*="categories.html"]',
    'a[href*="featured.html"]',
    'a[href*="products.html"]',
    'a[href="/"]',
    'a[href="./"]',
    'a[data-preserve-store]', // Links with data-preserve-store attribute
  ];
  
  const links = rootEl.querySelectorAll(selectors.join(','));
  links.forEach(link => {
    let href = link.getAttribute('href');
    if (!href) return;
    
    // Clean up any corrupted hrefs (remove accidentally appended text like "-featured" or "-products")
    // Pattern: featured.html-featured or products.html-products
    href = href.replace(/\.html-([a-z]+)$/i, '.html');
    
    // Skip if already has store parameter
    if (href.includes('store=')) return;
    
    // Skip external links (different hostname)
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const url = new URL(href);
        if (url.hostname !== window.location.hostname && url.hostname !== '') {
          return; // Skip external links
        }
      } catch (e) {
        // Invalid URL, skip
        return;
      }
    }
    
    // For all relative paths (including .html files), simply append store parameter
    // This is the most reliable approach
    const separator = href.includes('?') ? '&' : '?';
    const newHref = href + separator + 'store=' + encodeURIComponent(storeSlug);
    link.setAttribute('href', newHref);
  });
}

// Function to fix paths in loaded HTML based on current page location
function fixPathsInHTML(html, isInPagesFolder) {
        if (isInPagesFolder) {
          // If in pages folder, paths starting with "assets/" or "pages/" need "../"
          // But paths already with "../" should stay as is
          html = html.replace(/src="assets\//g, 'src="../assets/');
          html = html.replace(/href="pages\//g, 'href="');
          html = html.replace(/href="\.\.\/pages\//g, 'href="');
          html = html.replace(/href="index\.html/g, 'href="../index.html');
          
          // Fix sidebar links to use relative paths (remove pages/ prefix if exists)
          html = html.replace(/href="(pages\/)?(orders|wishlist|cart|order-tracking|faq)\.html/g, 'href="$2.html');
          // Ensure navigation links stay as relative paths (no modification needed, they're already correct)
          // Remove any accidental modifications that might have added text or hyphens
          html = html.replace(/href="(categories|featured|products)\.html-[^"]*"/g, 'href="$1.html"');
          html = html.replace(/href="(categories|featured|products)\.html\?[^"]*"/g, (match) => {
            // Preserve query params but ensure clean URL
            const cleanMatch = match.replace(/\.html-[^?]*\?/, '.html?');
            return cleanMatch;
          });
        } else {
          // If in root, paths with "../assets/" should be "assets/"
          html = html.replace(/src="\.\.\/assets\//g, 'src="assets/');
          html = html.replace(/href="\.\.\/pages\//g, 'href="pages/');
          
          // Fix sidebar links to use pages/ prefix
          html = html.replace(/href="(orders|wishlist|cart|order-tracking|faq)\.html"/g, 'href="pages/$1.html"');
        }
        return html;
      }

// Function to load a component file
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
    }
    let html = await response.text();
    
    // Fix paths based on current page location
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/') || currentPath.includes('\\pages\\');
    html = fixPathsInHTML(html, isInPagesFolder);
    
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
      
      // Preserve store context across navigation links
      const storeSlug = getCurrentStoreSlug();
      if (storeSlug) {
        appendStoreParamToLinks(element, storeSlug);
      }
      
      // Re-initialize any scripts that need to run after component loads
      if (typeof initializeComponents === 'function') {
        initializeComponents();
      }
      
      // Initialize profile sidebar if header was loaded
      if (elementId === 'header-placeholder') {
        // Initialize login modal IMMEDIATELY after header loads
        setTimeout(() => initializeLoginModalHandlers(), 50);
        // Disable login modal on non-index and non-login pages
        const isIndexPage = window.location.pathname === '/' || 
                            window.location.pathname.endsWith('index.html') ||
                            window.location.pathname.endsWith('/');
        
        const isLoginPage = window.location.pathname.includes('login.html') ||
                            window.location.href.includes('login.html');
        
        if (!isIndexPage && !isLoginPage) {
          setTimeout(() => {
            const loginModalOverlay = document.getElementById('loginModalOverlay');
            if (loginModalOverlay) {
              loginModalOverlay.style.display = 'none';
              loginModalOverlay.style.visibility = 'hidden';
              loginModalOverlay.style.pointerEvents = 'none';
              loginModalOverlay.style.opacity = '0';
            }
            
            // Disable form submission
            const otpForm = document.getElementById('otpForm');
            if (otpForm) {
              otpForm.onsubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              };
            }
          }, 50);
        }
        
        // Initialize login modal handlers - SIMPLIFIED & FAST
        function initLoginModal() {
          const overlay = document.getElementById('loginModalOverlay');
          if (!overlay || overlay.dataset.initialized) return;
          
          const closeBtn = document.getElementById('loginModalClose');
          const phoneForm = document.getElementById('loginPhoneForm');
          const otpForm = document.getElementById('otpForm');
          const resendBtn = document.getElementById('resendOtpBtn') || document.querySelector('.login-back-btn');
          
          // Close function
          function closeModal() {
            if (overlay) {
              overlay.classList.remove('active');
              overlay.style.display = 'none';
              overlay.style.visibility = 'hidden';
              overlay.style.opacity = '0';
              document.body.style.overflow = '';
              
              const otpContainer = document.getElementById('otpFormContainer');
              const loginContainer = document.getElementById('loginFormContainer');
              if (otpContainer) {
                otpContainer.style.display = 'none';
                otpContainer.style.visibility = 'hidden';
              }
              if (loginContainer) {
                loginContainer.style.display = 'block';
                loginContainer.style.visibility = 'visible';
              }
              
              const phoneInput = document.getElementById('loginPhone');
              const otpInput = document.getElementById('otpInput');
              if (phoneInput) phoneInput.value = '';
              if (otpInput) otpInput.value = '';
            }
            if (typeof window.closeLoginModal === 'function') {
              try { window.closeLoginModal(); } catch(e) {}
            }
          }
          
          // Close button
          if (closeBtn) {
            closeBtn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              closeModal();
            };
          }
          
          // Overlay click
          if (overlay) {
            overlay.onclick = function(e) {
              if (e.target === overlay) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
              }
            };
          }
          
          // Phone form
          if (phoneForm) {
            phoneForm.onsubmit = function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window.handlePhoneLogin === 'function') {
                try {
                  window.handlePhoneLogin(e);
                } catch(err) {
                  alert('Login error. Please try again.');
                }
              } else {
                alert('Login not available. Please refresh.');
              }
            };
          }
          
          // OTP form
          if (otpForm) {
            otpForm.onsubmit = function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window.handleOTPVerification === 'function') {
                try {
                  window.handleOTPVerification(e);
                } catch(err) {
                  alert('OTP error. Please try again.');
                }
              } else {
                alert('OTP verification not available. Please refresh.');
              }
            };
          }
          
          // Resend button
          if (resendBtn) {
            resendBtn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window.resendOTP === 'function') {
                try {
                  window.resendOTP();
                } catch(err) {
                  alert('Resend error. Please try again.');
                }
              } else {
                alert('Resend not available. Please refresh.');
              }
            };
          }
          
          overlay.dataset.initialized = 'true';
        }
        
        // Initialize once after short delay
        setTimeout(() => {
          initLoginModal();
          if (typeof window.initProfileSidebar === 'function') {
            window.initProfileSidebar();
          }
          if (typeof window.highlightActiveMenuItem === 'function') {
            window.highlightActiveMenuItem();
          }
        }, 50);
      }
    } else {
      console.warn(`Element with id "${elementId}" not found`);
    }
  } catch (error) {
    console.error(`Error loading component ${filePath}:`, error);
  }
}

// Determine the correct path based on current page location
function getComponentPath(componentName) {
  const currentPath = window.location.pathname;
  const isInPagesFolder = currentPath.includes('/pages/') || currentPath.includes('\\pages\\');
  
  // If we're in the pages folder, go up one level to access components
  if (isInPagesFolder) {
    return `../components/${componentName}`;
  } else {
    // If we're in the root, components are in the same level
    return `components/${componentName}`;
  }
}

// Load header and footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Load header
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    loadComponent('header-placeholder', getComponentPath('header.html'));
  }
  
  // Load footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    loadComponent('footer-placeholder', getComponentPath('footer.html'));
  }
});

// Export for use in other scripts
window.loadComponent = loadComponent;
window.getComponentPath = getComponentPath;

