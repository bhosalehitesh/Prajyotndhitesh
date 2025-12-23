import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Scrolls to top of page when route changes
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname or search params change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Also try scrolling document elements (for compatibility)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
