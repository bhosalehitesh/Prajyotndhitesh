import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { getBackendUrl } from '../utils/api';

// Re-export getBackendUrl if needed, or use API_CONFIG
import { API_CONFIG } from '../constants';

/**
 * Component to display store loading errors and diagnostic information
 */
const StoreError = () => {
  const { error, storeSlug, loading } = useStore();

  if (loading || !error) {
    return null;
  }

  // Get backend URL (same logic as api.js)
  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return API_CONFIG.BASE_URL;
    }
    return `${protocol}//${hostname}:8080/api`;
  };
  
  const apiBase = getBackendUrl();
  const testUrl = `${apiBase}/public/store/${encodeURIComponent(storeSlug)}`;

  return (
    <div style={{
      padding: '2rem',
      margin: '2rem auto',
      maxWidth: '800px',
      backgroundColor: '#fff3cd',
      border: '2px solid #ffc107',
      borderRadius: '8px',
      color: '#856404'
    }}>
      <h2 style={{ marginTop: 0, color: '#856404' }}>⚠️ Store Not Found</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Store Slug:</strong> <code>{storeSlug}</code>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Error:</strong> {error.message}
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '4px',
        marginTop: '1rem',
        fontSize: '0.9rem'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>🔍 Diagnostic Steps:</h3>
        <ol style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>
            <strong>Check Backend API:</strong>
            <br />
            <a href={testUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
              {testUrl}
            </a>
            <br />
            <small>This should return store data or 404 if store doesn't exist</small>
          </li>
          <li>
            <strong>Check Database:</strong>
            <br />
            <code style={{ backgroundColor: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
              SELECT store_id, store_name, store_link, seller_id FROM store_details WHERE store_link LIKE '%{storeSlug}%';
            </code>
          </li>
          <li>
            <strong>Verify store_link format:</strong>
            <br />
            The backend extracts slug from <code>store_link</code> field (everything after last <code>/</code>)
            <br />
            Example: <code>store_link = "https://domain.com/{storeSlug}"</code>
          </li>
          <li>
            <strong>Check Products:</strong>
            <br />
            Products must be linked to the store's <code>seller_id</code>
            <br />
            <code style={{ backgroundColor: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
              SELECT COUNT(*) FROM products WHERE seller_id = (SELECT seller_id FROM store_details WHERE store_link LIKE '%{storeSlug}%');
            </code>
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6c757d' }}>
        <strong>💡 Tip:</strong> If the store exists but products don't show, check that products are linked to the correct <code>seller_id</code>.
      </div>
    </div>
  );
};

export default StoreError;

