import React from 'react';

/**
 * Logo Forum Diskusi — Precision Interlocking Humans (Restored)
 * 1. 3 Kepala (Bulatan Luar): Formasi segitiga hijau terang di luar struktur utama.
 * 2. 3 Lengan/Badan (Interlocking): Garis lengkung tebal saling mengunci simetris.
 * 3. Pusat (Center Void): Pola kincir/shuriken di ruang negatif.
 */

interface LogoIconProps {
  size?: number;
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 32,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      {/* Gradasi Hijau Terang untuk Kepala */}
      <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00ff9d" />
        <stop offset="100%" stopColor="#00d084" />
      </linearGradient>
      
      {/* Gradasi Hijau Primary untuk Badan/Lengan */}
      <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d084" />
        <stop offset="100%" stopColor="#00a368" />
      </linearGradient>
    </defs>
    
    {/* ── GRUP STRUKTUR UTAMA ── */}
    <g transform="translate(12, 12)">
      
      {/* ── 3 KEPALA (BULATAN LUAR) ── */}
      {/* Posisi membentuk segitiga di luar perimeter garis badan */}
      <circle cx="0"   cy="-9.5" r="2.2" fill="url(#headGradient)" /> {/* Atas */}
      <circle cx="-8.2" cy="4.8"  r="2.2" fill="url(#headGradient)" /> {/* Kiri Bawah */}
      <circle cx="8.2"  cy="4.8"  r="2.2" fill="url(#headGradient)" /> {/* Kanan Bawah */}

      {/* ── 3 BADAN/LENGAN (INTERLOCKING) ── */}
      {/* Struktur anyaman yang saling mengunci membentuk void shuriken di tengah */}
      
      {/* Path 1 */}
      <path 
        d="M-1.5 -7.5 C -4 -7.5, -7 -5, -7 -1.5 C -7 1, -5 3.5, -1 4" 
        stroke="url(#bodyGradient)" 
        strokeWidth="2.8" 
        strokeLinecap="round"
      />
      
      {/* Path 2 (Rotated 120) */}
      <path 
        d="M-1.5 -7.5 C -4 -7.5, -7 -5, -7 -1.5 C -7 1, -5 3.5, -1 4" 
        stroke="url(#bodyGradient)" 
        strokeWidth="2.8" 
        strokeLinecap="round"
        transform="rotate(120)"
      />
      
      {/* Path 3 (Rotated 240) */}
      <path 
        d="M-1.5 -7.5 C -4 -7.5, -7 -5, -7 -1.5 C -7 1, -5 3.5, -1 4" 
        stroke="url(#bodyGradient)" 
        strokeWidth="2.8" 
        strokeLinecap="round"
        transform="rotate(240)"
      />

    </g>
  </svg>
);

const BRAND_NAME = 'SuaraKita';

const AnimatedText: React.FC<{ fontSize: number }> = ({ fontSize }) => {
  return (
    <span className="logo-brand-text-wrapper">
      <span
        className="logo-brand-text"
        style={{
          fontSize,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
};

interface LogoBrandProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const LogoBrand: React.FC<LogoBrandProps> = ({
  size = 44,
  showText = true,
  className,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: Math.round(size * 0.22),
    }}
    className={className}
  >
    <LogoIcon size={size} />

    {showText && <AnimatedText fontSize={size * 0.56} />}
  </span>
);

export default LogoBrand;
