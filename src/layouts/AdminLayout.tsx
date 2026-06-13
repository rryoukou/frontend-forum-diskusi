import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="layout-wrapper"
      style={{
        background: 'var(--bg)',
        /* FIX 1: full viewport height dengan flex column
           supaya main bisa flex: 1 dan tidak collapse */
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        style={{
          padding: 'var(--sp-8) var(--sp-6)',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          /* FIX 2: flex: 1 agar main mengisi sisa tinggi layar */
          flex: 1,
          /* FIX 3: box-sizing border-box agar padding tidak bikin overflow */
          boxSizing: 'border-box',
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
            /* FIX 4: INI KUNCI UTAMA — overflow hidden mencegah konten
               di dalam (right panel yang tiba-tiba muncul) mengembangkan
               ukuran container dan mendorong left panel bergeser */
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;