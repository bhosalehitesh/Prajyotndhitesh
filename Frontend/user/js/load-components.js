/**
 * Load Header and Footer Components
 * Dynamically loads header.html and footer.html and preserves store slug across navigation.
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

// Append store param to navigation links so cross-page navigation preserves store context
function appendStoreParamToLinks(rootEl, storeSlug) {
  if (!rootEl || !storeSlug) return;
  const selectors = [
    'a[href$="index.html"]',
    'a[href$="categories.html"]',
    'a[href$="featured.html"]',
    'a[href$="products.html"]',
    'a[href="/"]',
    'a[href="./"]',
  ];
  const links = rootEl.querySelectorAll(selectors.join(','));
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    try {
      const url = new URL(href, window.location.href);
      url.searchParams.set('store', storeSlug);
      link.setAttribute('href', url.pathname + url.search);
    } catch (e) {
      // ignore malformed URLs
    }
  });
}

// Fix paths in loaded HTML based on current page location
function fixPathsInHTML(html, isInPagesFolder) {
  if (isInPagesFolder) {
    html = html.replace(/src="assets\//g, 'src="../assets/');
    html = html.replace(/href="pages\//g, 'href="');
    html = html.replace(/href="\.\.\/pages\//g, 'href="');
    html = html.replace(/href="index\.html/g, 'href="../index.html');
    html = html.replace(/href="(pages\/)?(orders|wishlist|cart|order-tracking|faq)\.html/g, 'href="$2.html');
    html = html.replace(/href="categories\.html/g, 'href="categories.html');
    html = html.replace(/href="featured\.html/g, 'href="featured.html');
    html = html.replace(/href="products\.html/g, 'href="products.html');
  } else {
    html = html.replace(/src="\.\.\/assets\//g, 'src="assets/');
    html = html.replace(/href="\.\.\/pages\//g, 'href="pages/');
    html = html.replace(/href="(orders|wishlist|cart|order-tracking|faq)\.html"/g, 'href="pages/$1.html"');
  }
  return html;
}

// Load a component file into an element
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
    let html = await response.text();

    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/') || currentPath.includes('\\pages\\');
    html = fixPathsInHTML(html, isInPagesFolder);

    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;

      // Preserve store context
      const storeSlug = getCurrentStoreSlug();
      if (storeSlug) {
        appendStoreParamToLinks(element, storeSlug);
      }

      if (typeof initializeComponents === 'function') initializeComponents();
    }
  } catch (error) {
    console.error(`Error loading component ${filePath}:`, error);
  }
}

// Initialize components if needed
function initializeComponents() {
  // placeholder for additional init logic
}

// Fallback: on DOM ready, ensure links preserve store param even if components were already present
document.addEventListener('DOMContentLoaded', () => {
  const storeSlug = getCurrentStoreSlug();
  if (storeSlug) {
    appendStoreParamToLinks(document, storeSlug);

    // Intercept nav link clicks to inject store param if missing
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('http')) return; // skip external
      try {
        const url = new URL(href, window.location.href);
        // Only adjust site pages
        if (url.origin === window.location.origin) {
          if (!url.searchParams.get('store')) {
            url.searchParams.set('store', storeSlug);
            target.setAttribute('href', url.pathname + url.search);
          }
        }
      } catch (err) {
        // ignore malformed
      }
    }, { capture: true });
  }
});

