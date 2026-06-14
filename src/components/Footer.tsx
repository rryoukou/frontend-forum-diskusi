import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: 'var(--sp-6) 0',
      color: 'var(--text-3)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      fontSize: '0.78rem',
      fontWeight: 500,
      background: 'var(--surface)',
      letterSpacing: '0.01em',
    }}>
      <p>© 2026 <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Forum Diskusi</span>. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
