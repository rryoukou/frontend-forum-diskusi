import React from 'react';

/**
 * SuaraKita Logo — Wolf + Leaf Icon
 *
 * Logo wolf hijau aesthetic dengan daun, menggunakan gambar PNG dari public folder.
 * Scalable melalui prop `size`.
 */

interface LogoIconProps {
  size?: number;
  variant?: 'color' | 'white' | 'dark';
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 32,
  className,
}) => (
  <img
    src="/Logo.png"
    alt="SuaraKita"
    width={size}
    height={size}
    className={`logo-icon-img ${className || ''}`}
    aria-hidden="true"
    style={{
      objectFit: 'contain',
    }}
  />
);

/* ─────────────────────────────────────────────────────────────
   AnimatedText — Staggered character entrance for brand name
───────────────────────────────────────────────────────────── */

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
        }}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   LogoBrand — icon + wordmark "SuaraKita"
───────────────────────────────────────────────────────────── */

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
    <LogoIcon size={size} variant="color" />

    {showText && <AnimatedText fontSize={size * 0.56} />}
  </span>
);

export default LogoBrand;

