import React from 'react';
import Navbar from '../components/Navbar';

interface ModeratorLayoutProps {
  children: React.ReactNode;
}

const ModeratorLayout: React.FC<ModeratorLayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModeratorLayout;
