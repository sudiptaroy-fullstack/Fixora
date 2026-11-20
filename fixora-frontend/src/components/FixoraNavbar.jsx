import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  CalendarCheck,
  User,
  Wallet,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import FixoraLogo from './FixoraLogo';

export default function FixoraNavbar({
  userRole,
  profile,
  activeSection,
  onSelectSection,
  onOpenWithdraw,
  onLogout,
  darkMode = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (target) => {
    if (onSelectSection) onSelectSection(target);
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      id: 'HOME',
      label:
        userRole === 'ADMIN'
          ? 'Command Overview'
          : userRole === 'PROVIDER'
          ? 'Dispatch Board'
          : 'Services',
      icon: userRole === 'ADMIN' ? ShieldCheck : userRole === 'PROVIDER' ? Wrench : LayoutGrid,
      visible: true
    },
    {
      id: 'BOOKINGS',
      label: 'Track Bookings',
      icon: CalendarCheck,
      visible: userRole === 'CUSTOMER'
    },
    {
      id: 'PROFILE',
      label: profile?.fullName ? profile.fullName.split(' ')[0] : 'Profile',
      icon: User,
      visible: userRole !== 'ADMIN'
    }
  ].filter((item) => item.visible);

  const surfaceBg = darkMode
    ? 'rgba(28, 25, 23, 0.72)'
    : 'rgba(255, 255, 255, 0.68)';
  const borderCol = darkMode
    ? 'rgba(251, 146, 60, 0.25)'
    : 'rgba(28, 25, 23, 0.1)';
  const textCol = darkMode ? '#FAFAF9' : '#1C1917';

  return (
    <header
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 50,
        marginBottom: '24px',
        padding: '12px 18px',
        borderRadius: '20px',
        background: surfaceBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderCol}`,
        boxShadow: '0 10px 30px rgba(28, 25, 23, 0.06)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* Brand Logo + Role Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
          onClick={() => handleNavClick('HOME')}
        >
          <FixoraLogo size={38} darkText={!darkMode} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '999px',
              background: darkMode ? 'rgba(234, 88, 12, 0.22)' : 'rgba(234, 88, 12, 0.12)',
              color: '#EA580C',
              border: '1px solid rgba(234, 88, 12, 0.28)'
            }}
          >
            {userRole || 'GUEST'}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="fixora-desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 15px',
                  borderRadius: '999px',
                  border: isActive
                    ? '1px solid #EA580C'
                    : `1px solid ${borderCol}`,
                  background: isActive
                    ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)'
                    : darkMode
                    ? 'rgba(41, 37, 36, 0.8)'
                    : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? '#FFFFFF' : textCol,
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(234, 88, 12, 0.32)' : 'none'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {userRole !== 'ADMIN' && (
            <button
              type="button"
              onClick={onOpenWithdraw}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 15px',
                borderRadius: '999px',
                border: '1px solid rgba(234, 88, 12, 0.35)',
                background: darkMode ? 'rgba(234, 88, 12, 0.16)' : '#FFF7ED',
                color: '#EA580C',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              <Wallet size={15} />
              <span>₹{(profile?.walletBalance ?? 0).toFixed(0)} • Withdraw</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${borderCol}`,
                background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FFFFFF',
                color: darkMode ? '#FCA5A5' : '#DC2626',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </nav>

        {/* Mobile Drawer Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: '12px',
            border: `1px solid ${borderCol}`,
            background: darkMode ? 'rgba(41, 37, 36, 0.8)' : '#FFFFFF',
            color: textCol,
            cursor: 'pointer'
          }}
          className="fixora-mobile-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Responsive Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${borderCol}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? '#EA580C' : 'transparent',
                    color: isActive ? '#FFFFFF' : textCol,
                    fontWeight: '700',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {userRole !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenWithdraw) onOpenWithdraw();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(234, 88, 12, 0.35)',
                  background: '#FFF7ED',
                  color: '#EA580C',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Wallet size={16} />
                <span>Wallet: ₹{(profile?.walletBalance ?? 0).toFixed(0)} • Withdraw</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: '#DC2626',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .fixora-desktop-nav { display: none !important; }
          .fixora-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}