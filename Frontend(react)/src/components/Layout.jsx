import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Layout = ({ children }) => {
  // Update document title based on current store
  useDocumentTitle();

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

