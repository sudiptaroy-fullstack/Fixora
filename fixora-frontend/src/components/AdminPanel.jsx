import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminStats, getAllRequests, getAllMarketplaceProviders, getAllReviews } from '../services/api';
import FixoraNavbar from './FixoraNavbar';
import FixoraFooter from './FixoraFooter';
import { MotionVideoBackdrop, DropletReveal } from './MotionPrimitives';
import { TrendingUp, Users, MapPin } from 'lucide-react';

export default function AdminPanel({ onLogout }) {
  const [stats, setStats] = useState({ totalRequests: 0, pendingJobs: 0, acceptedJobs: 0, completedJobs: 0, declinedJobs: 0, totalRevenue: 0 });
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const s = await getAdminStats();
        if (s.data) setStats(s.data);
        const r = await getAllRequests();
        setRequests(r.data || []);
        const p = await getAllMarketplaceProviders();
        setProviders(p.data || []);
        const rev = await getAllReviews();
        setReviews(rev.data || []);
      } catch (e) {
        console.error('Admin sync error:', e);
      }
    };
    loadAdminData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '28px 40px', color: '#FAFAF9', position: 'relative' }}>
      <MotionVideoBackdrop variant="admin" />

      <div style={{ maxWidth: '1380px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="dark-glass-panel" style={{ padding: '20px 28px', marginBottom: '26px' }}>
          <FixoraNavbar
            userRole="ADMIN"
            profile={{ fullName: 'Executive Admin', phone: 'ADMIN-HQ', city: 'Command Center', walletBalance: stats.totalRevenue || 0 }}
            activeSection="HOME"
            onSelectSection={() => {}}
            onOpenWithdraw={() => {}}
            onLogout={onLogout}
            darkMode={true}
          />
          <span style={{ fontSize: '12px', color: '#FED7AA' }}>Live Telemetry • Escrow Audit • Specialist Wallets</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '26px' }}>
          {[
            { label: 'PLATFORM GMV', value: `₹${stats.totalRevenue || 0}`, accent: '#F97316' },
            { label: 'TOTAL BOOKINGS', value: stats.totalRequests, accent: '#FB923C' },
            { label: 'AWAITING PROVIDER', value: stats.pendingJobs, accent: '#FBBF24' },
            { label: 'COMPLETED', value: stats.completedJobs, accent: '#34D399' },
            { label: 'DECLINED / REFUNDED', value: stats.declinedJobs || 0, accent: '#F87171' }
          ].map((item, idx) => (
            <DropletReveal key={item.label} delay={idx * 0.06}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="dark-glass-panel"
                style={{ padding: '20px', borderTop: `3px solid ${item.accent}` }}
              >
                <span style={{ fontSize: '11px', color: '#D6D3D1', fontWeight: '700' }}>{item.label}</span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '27px', color: item.accent }}>{item.value}</h2>
              </motion.div>
            </DropletReveal>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.85fr', gap: '24px' }}>
          <DropletReveal delay={0.1}>
            <div className="dark-glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#FB923C" /> Live Marketplace Transaction & Escrow Audit
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    style={{ padding: '14px 18px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                  >
                    <div>
                      <strong>#{r.id} • {r.category}</strong> — Customer: <span style={{ color: '#FDBA74' }}>{r.customerPhone}</span> → Provider: <span style={{ color: '#FED7AA' }}>{r.providerName}</span>
                      {r.customerAddress && (
                        <div style={{ fontSize: '12px', color: '#E7E5E4', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#FB923C" /> {r.customerAddress} {r.customerCity ? `(${r.customerCity})` : ''}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '3px' }}>
                        Method: <strong>{r.paymentMethod}</strong> • Escrow: <strong>{r.paymentStatus}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', background: 'rgba(249,115,22,0.22)', color: '#FDBA74' }}>
                        {r.status}
                      </span>
                      <div style={{ fontWeight: '800', marginTop: '5px', color: '#FAFAF9' }}>₹{r.price}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </DropletReveal>

          <DropletReveal delay={0.18}>
            <div className="dark-glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#FB923C" /> Registered Specialists & Wallets
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {providers.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{p.fullName} ({p.category})</strong>
                      <span style={{ color: '#FB923C', fontWeight: '800' }}>Wallet: ₹{p.walletBalance}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '4px' }}>
                      Phone: {p.phone} • ★ {p.rating} • {p.completedJobs} Completed • {reviews.length} Reviews
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </DropletReveal>
        </div>

        <FixoraFooter />
      </div>
    </div>
  );
}