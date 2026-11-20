import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * 1. Continuous 60fps ambient motion video backdrop tailored per webpage
 *    Also automatically plays /fixora-bg.mp4 if placed inside public/
 */
export function MotionVideoBackdrop({ variant = 'login' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const palettes = {
      login: {
        bgTop: '#F5EFEA',
        bgBottom: '#E7D8CC',
        wave1: 'rgba(234, 88, 12, 0.26)',
        wave2: 'rgba(194, 65, 12, 0.34)',
        orb: 'rgba(251, 146, 60, 0.32)'
      },
      customer: {
        bgTop: '#FAF6F1',
        bgBottom: '#EFE4D8',
        wave1: 'rgba(249, 115, 22, 0.18)',
        wave2: 'rgba(217, 119, 6, 0.22)',
        orb: 'rgba(253, 186, 116, 0.35)'
      },
      provider: {
        bgTop: '#F7F1EA',
        bgBottom: '#E6D3C1',
        wave1: 'rgba(180, 83, 9, 0.24)',
        wave2: 'rgba(234, 88, 12, 0.28)',
        orb: 'rgba(245, 158, 11, 0.28)'
      },
      admin: {
        bgTop: '#261D18',
        bgBottom: '#17120F',
        wave1: 'rgba(249, 115, 22, 0.24)',
        wave2: 'rgba(234, 88, 12, 0.32)',
        orb: 'rgba(251, 146, 60, 0.22)'
      }
    };

    const p = palettes[variant] || palettes.login;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 24 }, (_, i) => ({
      x: (i * 97) % window.innerWidth,
      y: (i * 61) % window.innerHeight,
      r: 3 + (i % 5) * 2.5,
      speedY: 0.25 + (i % 4) * 0.14,
      drift: 0.4 + (i % 3) * 0.2
    }));

    const render = () => {
      t += 0.012;
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.bgTop);
      grad.addColorStop(1, p.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Glowing floating amber orbs
      for (let i = 0; i < 3; i++) {
        const ox = w * (0.25 + i * 0.28) + Math.sin(t * 0.7 + i) * 70;
        const oy = h * (0.35 + (i % 2) * 0.3) + Math.cos(t * 0.6 + i) * 55;
        const rad = Math.min(w, h) * (0.28 + i * 0.05);
        const orbGrad = ctx.createRadialGradient(ox, oy, 10, ox, oy, rad);
        orbGrad.addColorStop(0, p.orb);
        orbGrad.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sculpted terracotta fluid dune waves
      [p.wave1, p.wave2].forEach((fill, idx) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 24) {
          const y =
            h * (0.74 + idx * 0.08) +
            Math.sin(x * 0.0035 + t + idx * 1.4) * 34 +
            Math.cos(x * 0.007 - t * 0.8) * 18;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      });

      // Rising warm amber light droplets
      particles.forEach((pt, idx) => {
        pt.y -= pt.speedY;
        pt.x += Math.sin(t + idx) * pt.drift;
        if (pt.y < -20) {
          pt.y = h + 20;
          pt.x = Math.random() * w;
        }
        ctx.fillStyle = p.orb;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* Optional real MP4 video overlay if user adds public/fixora-bg.mp4 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.28,
          mixBlendMode: 'multiply'
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="/fixora-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

/**
 * 2. Scroll-triggered liquid droplet reveal for headings, text, and cards
 */
export function DropletReveal({ children, delay = 0, style = {}, className = '' }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: -22, scale: 0.94, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        mass: 0.85,
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3. Translucent orange glass crystals that animate in FIRST on the Login screen
 */
export function OrangeCrystalsStage() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '32px'
      }}
    >
      {/* Back tall amber glass crystal */}
      <motion.div
        initial={{ opacity: 0, y: 120, scaleY: 0.65, rotate: -6 }}
        animate={{ opacity: 1, y: [0, -10, 0], scaleY: 1, rotate: -3 }}
        transition={{
          opacity: { duration: 0.45, delay: 0.05 },
          scaleY: { type: 'spring', stiffness: 180, damping: 16, delay: 0.05 },
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
        }}
        style={{
          position: 'absolute',
          right: '24%',
          bottom: '10%',
          width: '155px',
          height: '360px',
          borderRadius: '90px 90px 24px 24px',
          background: 'linear-gradient(160deg, rgba(251, 146, 60, 0.52), rgba(194, 65, 12, 0.78))',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(255, 237, 213, 0.65)',
          boxShadow: '0 24px 48px rgba(194, 65, 12, 0.32), inset 0 2px 12px rgba(255,255,255,0.5)'
        }}
      />

      {/* Middle glowing burnt-orange crystal */}
      <motion.div
        initial={{ opacity: 0, y: 140, scaleY: 0.6, rotate: 8 }}
        animate={{ opacity: 1, y: [0, 12, 0], scaleY: 1, rotate: 4 }}
        transition={{
          opacity: { duration: 0.45, delay: 0.18 },
          scaleY: { type: 'spring', stiffness: 190, damping: 16, delay: 0.18 },
          y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }
        }}
        style={{
          position: 'absolute',
          right: '10%',
          bottom: '14%',
          width: '140px',
          height: '300px',
          borderRadius: '80px 80px 20px 20px',
          background: 'linear-gradient(155deg, rgba(253, 186, 116, 0.48), rgba(234, 88, 12, 0.75))',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 20px 42px rgba(234, 88, 12, 0.28), inset 0 2px 10px rgba(255,255,255,0.55)'
        }}
      />

      {/* Front frosted prism crystal */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.75 }}
        animate={{ opacity: 1, y: [0, -7, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.4, delay: 0.28 },
          scale: { type: 'spring', stiffness: 210, damping: 17, delay: 0.28 },
          y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }
        }}
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          background: 'rgba(255, 251, 247, 0.62)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          borderRadius: '24px',
          padding: '22px 24px',
          boxShadow: '0 20px 44px rgba(28, 25, 23, 0.14)'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#C2410C',
            letterSpacing: '0.9px',
            textTransform: 'uppercase'
          }}
        >
          AI-DRIVEN HOME CARE
        </div>
        <h3 style={{ margin: '8px 0 6px 0', fontSize: '22px', fontWeight: '800', color: '#1C1917', lineHeight: 1.25 }}>
          The smarter way to maintain your{' '}
          <span className="serif-italic" style={{ fontSize: '27px', color: '#EA580C' }}>
            sanctuary.
          </span>
        </h3>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#44403C', lineHeight: 1.5 }}>
          Instant AI root-cause diagnosis, verified local plumbers, electricians & carpenters, and protected escrow checkout.
        </p>
      </motion.div>
    </div>
  );
}