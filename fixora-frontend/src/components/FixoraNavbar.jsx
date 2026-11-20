import React from 'react';
import {
  MapPin,
  Search,
  CalendarCheck,
  User,
  Wallet,
  LogOut,
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
  searchQuery = '',
  onSearchChange,
  darkMode = false
}) {
  const bg = darkMode ? 'rgba(20, 18, 17, 0.78)' : 'rgba(255, 255, 255, 0.72)';
  const borderCol = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255, 255, 255, 0.85)';
  const textCol = darkMode ? '#FAFAF9' : '#1C1917';
  const subTextCol = darkMode ? '#A8A29E' : '#57534E';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: bg,
        backdropFilter: 'blur(20px) saturate(170%)',
        WebkitBackdropFilter: 'blur(20px) saturate(170%)',
        borderBottom: `1px solid ${borderCol}`,
        boxShadow: '0 8px 28px rgba(28, 25, 23, 0.05)',
        padding: '14px 32px',
        marginBottom: '26px'
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div
            onClick={() => onSelectSection && onSelectSection('HOME')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <FixoraLogo size={36} darkText={!darkMode} />
          </div>

          {userRole !== 'ADMIN' && (
            <div
              onClick={() => onSelectSection && onSelectSection('PROFILE')}
              title="Click to update doorstep address"
              style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                paddingLeft: '18px',
                borderLeft: '1px solid rgba(28,25,23,0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '800', color: textCol }}>
                <MapPin size={14} color="#EA580C" />
                <span>{profile?.address ? profile.address.slice(0, 26) : 'Set Doorstep Address'}</span>
              </div>
              <span style={{ fontSize: '11.5px', color: subTextCol, paddingLeft: '19px' }}>
                {profile?.city || 'Howrah, Kolkata'} ▾
              </span>
            </div>
          )}
        </div>

        {userRole === 'CUSTOMER' && (
          <div
            style={{
              flex: '1 1 340px',
              maxWidth: '460px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              borderRadius: '14px',
              border: '1px solid rgba(214, 211, 209, 0.8)',
              background: 'rgba(255, 255, 255, 0.85)'
            }}
          >
            <Search size={17} color="#78716C" />
            <input
              type="text"
              placeholder="Search for a service (e.g., AC, Plumber, Cleaning)..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13.5px',
                color: '#1C1917'
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {userRole === 'CUSTOMER' && (
            <button
              type="button"
              onClick={() => onSelectSection && onSelectSection('BOOKINGS')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '12px',
                border: activeSection === 'BOOKINGS' ? '1.5px solid #1C1917' : '1px solid rgba(28,25,23,0.12)',
                background: activeSection === 'BOOKINGS' ? '#1C1917' : 'rgba(255,255,255,0.85)',
                color: activeSection === 'BOOKINGS' ? '#FFFFFF' : '#1C1917',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <CalendarCheck size={15} />
              <span>Bookings</span>
            </button>
          )}

          {userRole === 'PROVIDER' && (
            <button
              type="button"
              onClick={() => onSelectSection && onSelectSection('HOME')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '12px',
                border: 'none',
                background: '#1C1917',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Wrench size={15} />
              <span>Dispatch Board</span>
            </button>
          )}

          {userRole !== 'ADMIN' && (
            <button
              type="button"
              onClick={onOpenWithdraw}
              title="Wallet & Withdraw"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 13px',
                borderRadius: '12px',
                border: '1px solid #FED7AA',
                background: 'rgba(255, 247, 237, 0.9)',
                color: '#C2410C',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              <Wallet size={15} />
              <span>₹{(profile?.walletBalance ?? 0).toFixed(0)}</span>
            </button>
          )}

          {userRole !== 'ADMIN' && (
            <button
              type="button"
              onClick={() => onSelectSection && onSelectSection('PROFILE')}
              title="Edit Profile"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: activeSection === 'PROFILE' ? '2px solid #EA580C' : '1px solid rgba(28,25,23,0.14)',
                background: 'rgba(255,255,255,0.88)',
                color: '#1C1917',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <User size={17} />
            </button>
          )}

          {userRole === 'ADMIN' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '800', color: '#FB923C', padding: '6px 12px', borderRadius: '999px', background: 'rgba(234,88,12,0.18)' }}>
              <ShieldCheck size={14} /> ADMIN
            </span>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '9px 13px',
                borderRadius: '12px',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                background: darkMode ? '#292524' : 'rgba(255,255,255,0.85)',
                color: darkMode ? '#FCA5A5' : '#DC2626',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}