import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Breadcrumb Component
 * Shows navigation path
 */
const Breadcrumb = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // For homepage, show full breadcrumb path
    if (path === ROUTES.HOME) {
      return [
        { path: ROUTES.HOME, label: 'Homepage' },
        { path: ROUTES.FEATURED, label: 'Featured Products' },
        { path: ROUTES.PRODUCTS, label: 'All Products' },
        { path: ROUTES.CATEGORIES, label: 'Categories' },
        { path: ROUTES.COLLECTIONS, label: 'Collections' },
      ];
    }
    
    const crumbs = [{ path: ROUTES.HOME, label: 'Homepage' }];

    if (path === ROUTES.FEATURED) {
      crumbs.push({ path: ROUTES.FEATURED, label: 'Featured Products' });
    } else if (path === ROUTES.PRODUCTS) {
      crumbs.push({ path: ROUTES.PRODUCTS, label: 'All Products' });
    } else if (path === ROUTES.CATEGORIES) {
      crumbs.push({ path: ROUTES.CATEGORIES, label: 'Categories' });
    } else if (path === ROUTES.COLLECTIONS) {
      crumbs.push({ path: ROUTES.COLLECTIONS, label: 'Collections' });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <li className="breadcrumb-item">
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-link active">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </li>
            {index < breadcrumbs.length - 1 && (
              <li className="breadcrumb-item">
                <span className="breadcrumb-separator">›</span>
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

