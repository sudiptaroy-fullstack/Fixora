import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API, {
  getAdminStats,
  getAllRequests,
  getAllMarketplaceProviders,
  getServicePackages
} from '../services/api';
import FixoraNavbar from './FixoraNavbar';
import FixoraFooter from './FixoraFooter';
import { MotionVideoBackdrop, DropletReveal } from './MotionPrimitives';
import {
  ShieldCheck,
  IndianRupee,
  Users,
  Briefcase,
  Lock,
  RefreshCw,
  PlusCircle,
  Package,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export default function AdminPanel({ onLogout }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    escrowHeld: 0,
    completedJobs: 0,
    activeProviders: 0
  });
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');

  // Quick Service Package Seeder State (Optional UI backup for POST /api/catalog/packages)
  const [newPkg, setNewPkg] = useState({
    title: '',
    category: 'Plumber',
    duration: '60 Mins',
    rating: '4.9',
    price: '',
    oldPrice: '',
    badge: 'Best Seller'
  });
  const [addingPkg, setAddingPkg] = useState(false);

  const fetchAdminTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, reqRes, provRes, pkgRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: null })),
        getAllRequests().catch(() => ({ data: [] })),
        getAllMarketplaceProviders().catch(() => ({ data: [] })),
        getServicePackages().catch(() => ({ data: [] }))
      ]);

      const reqList = reqRes?.data || [];
      const provList = provRes?.data || [];
      const pkgList = pkgRes?.data || [];

      setRequests(reqList);
      setProviders(provList);
      setPackages(pkgList);

      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        // Compute live telemetry directly from database lists if /admin/stats is minimal
        const totalRev = reqList
          .filter((r) => r.status !== 'DECLINED')
          .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        const escrow = reqList
          .filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED')
          .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        const completed = reqList.filter((r) => r.status === 'COMPLETED').length;

        setStats({
          totalBookings: reqList.length,
          totalRevenue: totalRev,
          escrowHeld: escrow,
          completedJobs: completed,
          activeProviders: provList.length
        });
      }
    } catch (err) {
      console.error('Admin telemetry error:', err);
      setBanner('Could not sync full telemetry from backend on port 8081.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initTelemetry = async () => {
      const [statsRes, reqRes, provRes, pkgRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: null })),
        getAllRequests().catch(() => ({ data: [] })),
        getAllMarketplaceProviders().catch(() => ({ data: [] })),
        getServicePackages().catch(() => ({ data: [] }))
      ]);

      if (!isMounted) return;

      const reqList = reqRes?.data || [];
      const provList = provRes?.data || [];
      const pkgList = pkgRes?.data || [];

      setRequests(reqList);
      setProviders(provList);
      setPackages(pkgList);

      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        const totalRev = reqList
          .filter((r) => r.status !== 'DECLINED')
          .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        const escrow = reqList
          .filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED')
          .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        const completed = reqList.filter((r) => r.status === 'COMPLETED').length;

        setStats({
          totalBookings: reqList.length,
          totalRevenue: totalRev,
          escrowHeld: escrow,
          completedJobs: completed,
          activeProviders: provList.length
        });
      }
      setLoading(false);
    };

    initTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!newPkg.title.trim() || !newPkg.price) return;
    setAddingPkg(true);
    try {
      await API.post('/catalog/packages', {
        ...newPkg,
        price: Number(newPkg.price),
        oldPrice: newPkg.oldPrice ? Number(newPkg.oldPrice) : null
      });
      setBanner(`Service package "${newPkg.title}" published to MySQL!`);
      setNewPkg({
        title: '',
        category: 'Plumber',
        duration: '60 Mins',
        rating: '4.9',
        price: '',
        oldPrice: '',
        badge: 'Best Seller'
      });
      fetchAdminTelemetry();
    } catch {
      setBanner('Failed to add service package. Verify CatalogController is running.');
    } finally {
      setAddingPkg(false);
    }
  };

  const totalGmv =
    stats.totalRevenue ??
    requests
      .filter((r) => r.status !== 'DECLINED')
      .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  const escrowBalance =
    stats.escrowHeld ??
    requests
      .filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED')
      .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 36px', position: 'relative' }}>
      <MotionVideoBackdrop variant="admin" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '24px 34px',
          borderRadius: '28px',
          background: 'rgba(20, 18, 17, 0.86)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(251, 146, 60, 0.28)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          color: '#FAFAF9',
          position: 'relative',
          zIndex: 2
        }}
      >
        <FixoraNavbar
          userRole="ADMIN"
          profile={{ fullName: 'Admin HQ', walletBalance: escrowBalance }}
          activeSection="HOME"
          onSelectSection={() => {}}
          onOpenWithdraw={() => {}}
          onLogout={onLogout}
          darkMode={true}
        />

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '13px 18px',
                marginBottom: '20px',
                borderRadius: '16px',
                background: 'rgba(234, 88, 12, 0.22)',
                border: '1px solid rgba(251, 146, 60, 0.45)',
                color: '#FED7AA',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>✓ {banner}</span>
              <button
                type="button"
                onClick={() => setBanner('')}
                style={{ background: 'none', border: 'none', color: '#FED7AA', fontWeight: '800', cursor: 'pointer' }}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <DropletReveal>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '26px',
              paddingBottom: '18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <ShieldCheck size={15} /> Fixora Central Telemetry & Escrow Audit
              </div>
              <h1 style={{ margin: '6px 0 0 0', fontSize: '30px', fontWeight: '800', color: '#FAFAF9' }}>
                Admin Command Center
              </h1>
            </div>

            <button
              type="button"
              onClick={fetchAdminTelemetry}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                background: 'rgba(234, 88, 12, 0.18)',
                color: '#FDBA74',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Refresh Live Telemetry'}
            </button>
          </div>
        </DropletReveal>

        {/* KPI Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '18px',
            marginBottom: '30px'
          }}
        >
          <div style={{ padding: '22px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.24), rgba(41, 37, 36, 0.85))', border: '1px solid rgba(251, 146, 60, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FDBA74', fontSize: '11.5px', fontWeight: '800' }}>
              <span>GROSS MARKETPLACE GMV</span>
              <IndianRupee size={16} />
            </div>
            <h2 style={{ margin: '10px 0 4px 0', fontSize: '32px', fontWeight: '800', color: '#FFFFFF' }}>
              ₹{Number(totalGmv).toFixed(0)}
            </h2>
            <span style={{ fontSize: '12px', color: '#D6D3D1' }}>Total non-declined order volume</span>
          </div>

          <div style={{ padding: '22px', borderRadius: '20px', background: 'rgba(41, 37, 36, 0.78)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FBBF24', fontSize: '11.5px', fontWeight: '800' }}>
              <span>ACTIVE ESCROW HELD</span>
              <Lock size={16} />
            </div>
            <h2 style={{ margin: '10px 0 4px 0', fontSize: '32px', fontWeight: '800', color: '#FDE68A' }}>
              ₹{Number(escrowBalance).toFixed(0)}
            </h2>
            <span style={{ fontSize: '12px', color: '#A8A29E' }}>Locked in pending/active jobs</span>
          </div>

          <div style={{ padding: '22px', borderRadius: '20px', background: 'rgba(41, 37, 36, 0.78)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34D399', fontSize: '11.5px', fontWeight: '800' }}>
              <span>TOTAL SERVICE REQUESTS</span>
              <Briefcase size={16} />
            </div>
            <h2 style={{ margin: '10px 0 4px 0', fontSize: '32px', fontWeight: '800', color: '#FFFFFF' }}>
              {requests.length}
            </h2>
            <span style={{ fontSize: '12px', color: '#A8A29E' }}>
              {requests.filter((r) => r.status === 'COMPLETED').length} completed • {requests.filter((r) => r.status === 'PENDING').length} pending
            </span>
          </div>

          <div style={{ padding: '22px', borderRadius: '20px', background: 'rgba(41, 37, 36, 0.78)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#60A5FA', fontSize: '11.5px', fontWeight: '800' }}>
              <span>VERIFIED SPECIALISTS</span>
              <Users size={16} />
            </div>
            <h2 style={{ margin: '10px 0 4px 0', fontSize: '32px', fontWeight: '800', color: '#FFFFFF' }}>
              {providers.length}
            </h2>
            <span style={{ fontSize: '12px', color: '#A8A29E' }}>{packages.length} active catalog packages</span>
          </div>
        </div>

        {/* Main Two-Column Grid: Escrow Ledger + Specialist Wallets & Catalog Seeder */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Live Escrow & Booking Audit Ledger */}
          <div style={{ padding: '24px', borderRadius: '22px', background: 'rgba(41, 37, 36, 0.72)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#FAFAF9' }}>
              Live Escrow & Service Ledger ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '13.5px', color: '#A8A29E' }}>
                No bookings recorded in MySQL yet. Create a booking from the Customer Portal to inspect escrow telemetry here.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#A8A29E', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 8px' }}>ID</th>
                      <th style={{ padding: '10px 8px' }}>Customer</th>
                      <th style={{ padding: '10px 8px' }}>Provider</th>
                      <th style={{ padding: '10px 8px' }}>Service & Ref</th>
                      <th style={{ padding: '10px 8px' }}>Amount</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '800', color: '#FB923C' }}>#{req.id}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: '700' }}>{req.customerName || req.customerPhone}</div>
                          <div style={{ fontSize: '11px', color: '#A8A29E' }}>{req.customerCity || req.customerPhone}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: '700' }}>{req.providerName}</div>
                          <div style={{ fontSize: '11px', color: '#A8A29E' }}>{req.category}</div>
                        </td>
                        <td style={{ padding: '12px 8px', maxWidth: '220px', color: '#E7E5E4' }}>
                          {req.problemDescription}
                          <div style={{ fontSize: '11px', color: '#FDBA74', marginTop: '2px' }}>{req.paymentMethod}</div>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '800', color: '#FFFFFF' }}>₹{req.price}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background:
                                req.status === 'COMPLETED'
                                  ? 'rgba(22, 163, 74, 0.25)'
                                  : req.status === 'DECLINED'
                                  ? 'rgba(220, 38, 38, 0.25)'
                                  : 'rgba(234, 88, 12, 0.25)',
                              color:
                                req.status === 'COMPLETED'
                                  ? '#86EFAC'
                                  : req.status === 'DECLINED'
                                  ? '#FCA5A5'
                                  : '#FDBA74'
                            }}
                          >
                            {req.status === 'COMPLETED' ? (
                              <CheckCircle2 size={12} />
                            ) : req.status === 'DECLINED' ? (
                              <XCircle size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Specialist Wallets + Quick Package Publisher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Registered Specialists & Wallets */}
            <div style={{ padding: '22px', borderRadius: '22px', background: 'rgba(41, 37, 36, 0.72)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', fontWeight: '800', color: '#FAFAF9' }}>
                Specialist Wallets ({providers.length})
              </h3>
              {providers.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#A8A29E', margin: 0 }}>
                  No providers registered yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                  {providers.map((p) => (
                    <div
                      key={p.id || p.phone}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: 'rgba(28, 25, 23, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#FAFAF9' }}>{p.fullName}</div>
                        <div style={{ fontSize: '11.5px', color: '#A8A29E' }}>
                          {p.category} • +91 {p.phone} • {p.completedJobs ?? 0} jobs
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#FB923C' }}>
                          ₹{(p.walletBalance ?? 0).toFixed(0)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#78716C' }}>Wallet</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Service Package Creator */}
            <div style={{ padding: '22px', borderRadius: '22px', background: 'rgba(41, 37, 36, 0.72)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: '800', color: '#FAFAF9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={17} color="#FB923C" /> Add Service Package ({packages.length})
              </h3>
              <form onSubmit={handleAddPackage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Package Title (e.g., Tap & Pipe Leak Fix)"
                  value={newPkg.title}
                  onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })}
                  required
                  style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(28,25,23,0.85)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    value={newPkg.category}
                    onChange={(e) => setNewPkg({ ...newPkg, category: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(28,25,23,0.85)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC & Appliance">AC & Appliance</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Painting">Painting</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 60 Mins)"
                    value={newPkg.duration}
                    onChange={(e) => setNewPkg({ ...newPkg, duration: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(28,25,23,0.85)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Offer Price (₹)"
                    value={newPkg.price}
                    onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                    required
                    min="1"
                    style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(28,25,23,0.85)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                  />
                  <input
                    type="number"
                    placeholder="Original MRP (₹)"
                    value={newPkg.oldPrice}
                    onChange={(e) => setNewPkg({ ...newPkg, oldPrice: e.target.value })}
                    min="1"
                    style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(28,25,23,0.85)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={addingPkg}
                  className="dialer-btn"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <span className="dialer-btn-inner" style={{ width: '100%', padding: '10px 16px', fontSize: '12.5px' }}>
                    <PlusCircle size={15} /> {addingPkg ? 'Publishing...' : 'Publish Package to Catalog'}
                  </span>
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        <FixoraFooter />
      </motion.div>
    </div>
  );
}