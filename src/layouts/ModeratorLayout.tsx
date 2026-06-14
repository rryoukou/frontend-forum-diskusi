import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface ModeratorLayoutProps {
  children: React.ReactNode;
}

const ModeratorLayout: React.FC<ModeratorLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper" style={{ background: 'var(--bg)' }}>
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        style={{
          padding: 'var(--sp-8) var(--sp-6)',
          maxWidth: '1040px',
          margin: '0 auto',
          flex: 1,
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            padding: 'var(--sp-8)',
            minHeight: '60vh',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModeratorLayout;
