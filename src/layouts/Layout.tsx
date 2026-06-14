import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAppSelector } from '../store/hooks';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="layout-wrapper">
      <Navbar onOpenSidebar={user ? () => setSidebarOpen(true) : undefined} />
      {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <main
        className="container page-enter"
        style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-12)' }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
