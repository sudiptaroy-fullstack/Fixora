import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Hammer, Cog, Settings, Nut, Sparkles } from 'lucide-react';

const MECHANICAL_ELEMENTS = [
  { id: 1, Icon: Cog, size: 110, top: '8%', left: '4%', duration: 28, dir: 1, driftY: 22, opacity: 0.08 },
  { id: 2, Icon: Settings, size: 84, top: '16%', left: '11%', duration: 22, dir: -1, driftY: -18, opacity: 0.07 },
  { id: 3, Icon: Wrench, size: 68, top: '14%', right: '7%', duration: 14, dir: 1, driftY: 26, opacity: 0.085 },
  { id: 4, Icon: Cog, size: 130, top: '44%', right: '3%', duration: 34, dir: -1, driftY: -24, opacity: 0.075 },
  { id: 5, Icon: Hammer, size: 62, top: '52%', left: '6%', duration: 16, dir: 1, driftY: 20, opacity: 0.08 },
  { id: 6, Icon: Nut, size: 54, top: '72%', left: '14%', duration: 19, dir: -1, driftY: -22, opacity: 0.075 },
  { id: 7, Icon: Wrench, size: 76, top: '76%', right: '11%', duration: 17, dir: 1, driftY: 24, opacity: 0.08 },
  { id: 8, Icon: Cog, size: 96, top: '82%', left: '46%', duration: 30, dir: 1, driftY: -16, opacity: 0.065 }
];

export function MechanicalToolsBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 48%, #EFE7DC 100%)'
      }}
    >
      <motion.div
        animate={{ x: [0, 45, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-6%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.16) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-6%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, transparent 70%)',
          filter: 'blur(34px)'
        }}
      />

      {MECHANICAL_ELEMENTS.map((item) => {
        const ToolIcon = item.Icon;
        return (
          <motion.div
            key={item.id}
            animate={{
              rotate: item.dir === 1 ? [0, 360] : [360, 0],
              y: [0, item.driftY, 0]
            }}
            transition={{
              rotate: { duration: item.duration, repeat: Infinity, ease: 'linear' },
              y: { duration: item.duration * 0.45, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: item.opacity,
              color: '#9A3412'
            }}
          >
            <ToolIcon size={item.size} strokeWidth={1.35} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Preserved for Login.jsx & AdminPanel.jsx compatibility
export function MotionVideoBackdrop({ variant = 'customer' }) {
  if (variant === 'admin') {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 20% 20%, #292524 0%, #0C0A09 100%)'
        }}
      />
    );
  }
  return <MechanicalToolsBackdrop />;
}

export function OrangeCrystalsStage() {
  const crystals = [
    { top: '12%', left: '18%', size: 84, rotate: 18, delay: 0.1 },
    { top: '34%', right: '14%', size: 112, rotate: -24, delay: 0.25 },
    { bottom: '16%', left: '22%', size: 96, rotate: 32, delay: 0.4 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        borderRadius: '28px',
        background: 'linear-gradient(145deg, #1C1917 0%, #292524 55%, #9A3412 100%)',
        padding: '36px',
        color: '#FAFAF9',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(251, 146, 60, 0.35)',
        boxShadow: '0 24px 50px rgba(28, 25, 23, 0.24)'
      }}
    >
      {crystals.map((c, idx) => (
        <motion.div
          key={idx}
          animate={{ y: [0, -14, 0], rotate: [c.rotate, c.rotate + 10, c.rotate] }}
          transition={{ duration: 5 + idx, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
          style={{
            position: 'absolute',
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            width: `${c.size}px`,
            height: `${c.size}px`,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.42), rgba(234, 88, 12, 0.12))',
            border: '1px solid rgba(253, 186, 116, 0.45)',
            backdropFilter: 'blur(8px)'
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(249,115,22,0.2)', color: '#FDBA74', fontSize: '11.5px', fontWeight: '800' }}>
          <Sparkles size={13} /> Escrow-Protected Home Services
        </span>
        <h2 style={{ fontSize: '30px', fontWeight: '800', margin: '16px 0 10px 0', lineHeight: 1.2 }}>
          Verified specialists at your doorstep.
        </h2>
        <p style={{ fontSize: '13.5px', color: '#D6D3D1', lineHeight: 1.6, margin: 0 }}>
          Instant AI issue diagnosis, fixed upfront pricing, and Razorpay escrow protection on every booking.
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 18px', borderRadius: '18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', fontSize: '12.5px', color: '#FED7AA' }}>
        <strong>Live Dispatch Network:</strong> Plumbers • Electricians • AC Technicians • Home Cleaning • Painting
      </div>
    </motion.div>
  );
}

export function DropletReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay }}
    >
      {children}
    </motion.div>
  );
}