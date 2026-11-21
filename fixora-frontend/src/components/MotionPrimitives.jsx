import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Hammer, Cog, Settings, Sparkles } from 'lucide-react';

// Custom crisp Screwdriver SVG matching Lucide stroke style
function ScrewdriverIcon({ size = 64, strokeWidth = 1.4 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 0 0-2.83l-.7-.7a2 2 0 0 0-2.83 0Z" />
      <path d="m14 8-7.5 7.5" />
      <path d="m5 14 5 5" />
      <path d="m2 22 4.5-1.5L9 18l-3-3-2.5 2.5Z" />
    </svg>
  );
}

const MECHANICAL_ELEMENTS = [
  { id: 1, Icon: Cog, size: 112, top: '8%', left: '3%', duration: 28, dir: 1, driftY: 22 },
  { id: 2, Icon: Wrench, size: 74, top: '14%', left: '13%', duration: 15, dir: -1, driftY: -18 },
  { id: 3, Icon: ScrewdriverIcon, size: 72, top: '12%', right: '6%', duration: 16, dir: 1, driftY: 24 },
  { id: 4, Icon: Cog, size: 132, top: '42%', right: '2%', duration: 34, dir: -1, driftY: -24 },
  { id: 5, Icon: Hammer, size: 70, top: '48%', left: '4%', duration: 16, dir: 1, driftY: 20 },
  { id: 6, Icon: ScrewdriverIcon, size: 68, top: '74%', left: '11%', duration: 18, dir: -1, driftY: -22 },
  { id: 7, Icon: Wrench, size: 80, top: '76%', right: '9%', duration: 17, dir: 1, driftY: 24 },
  { id: 8, Icon: Hammer, size: 66, top: '84%', left: '46%', duration: 19, dir: 1, driftY: -16 },
  { id: 9, Icon: Settings, size: 88, top: '28%', right: '14%', duration: 24, dir: -1, driftY: 18 }
];

function InteractiveToolItem({ item }) {
  const [spinCount, setSpinCount] = useState(0);
  const [hovered, setHovered] = useState(false);
  const ToolIcon = item.Icon;

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setSpinCount((prev) => prev + 1)}
      animate={{
        y: [0, item.driftY, 0],
        rotate: spinCount * 360 + (hovered ? 18 : 0),
        scale: hovered ? 1.28 : 1
      }}
      whileTap={{ scale: 0.85, rotate: spinCount * 360 - 25 }}
      transition={{
        y: { duration: item.duration * 0.45, repeat: Infinity, ease: 'easeInOut' },
        rotate: { type: 'spring', stiffness: 260, damping: 16 },
        scale: { type: 'spring', stiffness: 320, damping: 18 }
      }}
      title="Click or hover tool"
      style={{
        position: 'absolute',
        top: item.top,
        left: item.left,
        right: item.right,
        pointerEvents: 'auto',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '50%',
        color: hovered ? '#EA580C' : '#9A3412',
        opacity: hovered ? 0.42 : 0.11,
        filter: hovered ? 'drop-shadow(0 8px 18px rgba(234, 88, 12, 0.35))' : 'none',
        transition: 'opacity 0.25s ease, color 0.25s ease, filter 0.25s ease'
      }}
    >
      <motion.div
        animate={{ rotate: item.dir === 1 ? [0, 360] : [360, 0] }}
        transition={{ duration: item.duration, repeat: Infinity, ease: 'linear' }}
      >
        <ToolIcon size={item.size} strokeWidth={1.45} />
      </motion.div>
    </motion.div>
  );
}

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
      {/* Warm Ambient Glass Glow Orbs */}
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

      {/* Interactive Floating Hammers, Wrenches, Screwdrivers & Gears */}
      {MECHANICAL_ELEMENTS.map((item) => (
        <InteractiveToolItem key={item.id} item={item} />
      ))}
    </div>
  );
}

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