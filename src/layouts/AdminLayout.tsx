import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper" style={{ background: 'var(--bg)' }}>
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        style={{
          padding: 'var(--sp-8) var(--sp-6)',
          maxWidth: '1240px',
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

export default AdminLayout;
