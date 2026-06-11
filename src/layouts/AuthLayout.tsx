import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthModal } from '../context/AuthModalContext';
import { LogoBrand } from '../components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout khusus halaman autentikasi (Login & Register).
 * Full-screen, tanpa Navbar/Sidebar/Footer — hanya branding minimal di pojok kiri atas.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { openLogin, openRegister } = useAuthModal();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080c09',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Minimal top bar ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: 'var(--sp-4) var(--sp-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{ textDecoration: 'none' }}
          aria-label="SuaraKita — Home"
        >
          <LogoBrand size={36} showText={true} />
        </Link>

        {/* Nav links */}
        <nav
          style={{ display: 'flex', gap: 'var(--sp-2)' }}
          aria-label="Auth navigation"
        >
          <button onClick={openLogin}    className="btn btn-outline btn-sm">Login</button>
          <button onClick={openRegister} className="btn btn-primary  btn-sm">Register</button>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
