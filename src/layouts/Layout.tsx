import React from 'react';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)' }}>
        {children}
      </main>
      <footer style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-8) 0', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'var(--spacing-8)'
      }}>
        <p>&copy; 2026 Forum Diskusi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
