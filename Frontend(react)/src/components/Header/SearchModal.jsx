import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Search Modal Component
 * Handles product search functionality
 */
const SearchModal = ({ isOpen, onClose, searchQuery, onSearchChange }) => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal" style={{display: 'flex'}} onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Search Products</h3>
        <form onSubmit={handleSearch} style={{position: 'relative', marginBottom: '20px'}}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            style={{width: '100%', padding: '12px 40px 12px 16px', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '1rem'}}
          />
          <button 
            type="button" 
            className="search-close" 
            onClick={onClose}
            style={{position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
          >
            &times;
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchModal;

