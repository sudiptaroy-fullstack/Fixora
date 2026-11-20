import { ShieldCheck, Sparkles, Clock, PhoneCall, MapPin } from 'lucide-react';
import FixoraLogo from './FixoraLogo';

const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'AC & Appliance',
  'Cleaning',
  'Painting'
];

export default function FixoraFooter({ onSelectCategory }) {
  const handleCategoryClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        marginTop: '48px',
        padding: '32px 28px 22px',
        borderRadius: '22px',
        background: 'rgba(255, 255, 255, 0.62)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(28, 25, 23, 0.1)',
        color: '#44403C'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '28px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(28, 25, 23, 0.08)'
        }}
      >
        {/* Column 1: Brand Summary */}
        <div>
          <FixoraLogo size={34} darkText />
          <p
            style={{
              marginTop: '12px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#57534E'
            }}
          >
            AI-diagnosed home repair & verified doorstep specialist dispatch with
            escrow-protected Razorpay payments.
          </p>
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '999px',
                background: '#FFF7ED',
                color: '#C2410C',
                border: '1px solid #FDBA74'
              }}
            >
              <ShieldCheck size={13} /> Escrow Protected
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '999px',
                background: '#F5F5F4',
                color: '#1C1917',
                border: '1px solid rgba(28,25,23,0.12)'
              }}
            >
              <Sparkles size={13} /> Gemini AI Triage
            </span>
          </div>
        </div>

        {/* Column 2: Quick Service Categories */}
        <div>
          <h4
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1C1917'
            }}
          >
            Home Services
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: onSelectCategory ? '#EA580C' : '#57534E',
                    cursor: onSelectCategory ? 'pointer' : 'default',
                    textAlign: 'left'
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support & Coverage */}
        <div>
          <h4
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1C1917'
            }}
          >
            Dispatch & Support
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              fontSize: '13px',
              color: '#57534E'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#EA580C" /> 60-Min Express Dispatch (7 AM – 10 PM)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={14} color="#EA580C" /> 24×7 Escrow Desk: +91 1800-FIXORA
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} color="#EA580C" /> Kolkata • Howrah • Siliguri • Metro Hubs
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div
        style={{
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          color: '#78716C'
        }}
      >
        <span>© 2026 Fixora Home Care. All rights reserved.</span>
        <span>Built with React, Spring Boot & MySQL</span>
      </div>
    </footer>
  );
}