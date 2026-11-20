import React from 'react';
import { motion } from 'framer-motion';

export default function FixoraLogo({ size = 40, showText = true, darkText = true }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fixoraOrange" x1="15" y1="10" x2="105" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9E1B" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        {/* Roof + Chimney */}
        <path
          d="M14 52L60 14L90 39V24H106V52L108 54L99 63L60 30L23 61L14 52Z"
          fill="url(#fixoraOrange)"
        />
        <path d="M23 61L60 30L99 63L92 69L60 42L30 67L23 61Z" fill="#1F2421" />
        {/* 4-pane window */}
        <rect x="52" y="47" width="7" height="7" rx="1.5" fill="#F97316" />
        <rect x="61" y="47" width="7" height="7" rx="1.5" fill="#F97316" />
        <rect x="52" y="56" width="7" height="7" rx="1.5" fill="#F97316" />
        <rect x="61" y="56" width="7" height="7" rx="1.5" fill="#F97316" />
        {/* F-stem + Wrench cutout */}
        <path
          d="M28 74C28 67 34 62 41 62H88V76H58V86H80V98H58V104L42 114V76H41C38 76 36 78 36 81V114L28 109V74Z"
          fill="url(#fixoraOrange)"
        />
        {/* Wrench silhouette */}
        <path
          d="M44 74C40 74 37 77 37 81C37 84 39 87 42 88V111L48 107V88C51 87 53 84 53 81C53 77 50 74 46 74V80H44V74Z"
          fill="#1F2421"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '23px',
              fontWeight: '800',
              letterSpacing: '-0.6px',
              color: darkText ? '#1C1917' : '#FAFAF9'
            }}
          >
            fixora
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(249, 115, 22, 0.14)',
              color: '#C2410C',
              border: '1px solid rgba(249, 115, 22, 0.28)'
            }}
          >
            v2.4 Live
          </span>
        </div>
      )}
    </motion.div>
  );
}