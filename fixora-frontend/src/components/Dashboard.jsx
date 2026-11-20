import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAiRecommendation,
  getServicePackages,
  createServiceRequest,
  getCustomerRequests,
  getProviderRequests,
  respondToRequest,
  getUserProfile,
  updateUserProfile,
  getAllMarketplaceProviders,
  withdrawWallet,
  getAllReviews,
  addReview
} from '../services/api';
import FixoraNavbar from './FixoraNavbar';
import FixoraFooter from './FixoraFooter';
import { MotionVideoBackdrop, DropletReveal } from './MotionPrimitives';
import {
  Wrench, Zap, Hammer, Sparkles, Search,
  CreditCard, Star, Banknote,
  BarChart3, XCircle, Check, MapPin, Wind, Paintbrush, Droplets, Clock
} from 'lucide-react';

const CATEGORY_TILES = [
  { id: 'Plumber', title: 'Plumber & Pipe Care', icon: Wrench, color: '#EA580C' },
  { id: 'Electrician', title: 'Electrician & Wiring', icon: Zap, color: '#D97706' },
  { id: 'Carpenter', title: 'Carpenter & Woodwork', icon: Hammer, color: '#C2410C' },
  { id: 'AC & Appliance', title: 'AC & Appliance Repair', icon: Wind, color: '#EA580C' },
  { id: 'Cleaning', title: 'Bathroom & Home Cleaning', icon: Droplets, color: '#B45309' },
  { id: 'Painting', title: 'Painting & Waterproofing', icon: Paintbrush, color: '#9A3412' }
];

export default function Dashboard({ userSession, onLogout }) {
  const userPhone = userSession?.phone || '';
  const userRole = userSession?.role || 'CUSTOMER';

  const [section, setSection] = useState('HOME'); // HOME | BOOKINGS | PROFILE
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState(null);
  const [providersList, setProvidersList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [selectedProviderPhone, setSelectedProviderPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('RAZORPAY_UPI');
  const [problemDescription, setProblemDescription] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banner, setBanner] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [reviewForm, setReviewForm] = useState({ serviceCategory: '', rating: 5, comment: '' });

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpiOrBank, setWithdrawUpiOrBank] = useState('');
  const [fallbackCheckout, setFallbackCheckout] = useState(null);

  const loadAll = async () => {
    if (!userPhone) return;
    try {
      const [profRes, provRes, pkgRes, revRes, reqRes] = await Promise.all([
        getUserProfile(userPhone, userRole),
        getAllMarketplaceProviders(),
        getServicePackages().catch(() => ({ data: [] })),
        getAllReviews().catch(() => ({ data: [] })),
        userRole === 'CUSTOMER' ? getCustomerRequests(userPhone) : getProviderRequests(userPhone)
      ]);

      if (profRes.data) setProfile(profRes.data);

      const provData = provRes.data || [];
      setProvidersList(provData);
      if (provData.length > 0 && !selectedProviderPhone) {
        setSelectedProviderPhone(provData[0].phone);
      }

      setPackagesList(pkgRes.data || []);
      setReviews(revRes.data || []);
      setBookings(reqRes.data || []);
    } catch (e) {
      console.error('Database sync error:', e);
      setBanner('Could not fetch live records from database.');
    }
  };

  useEffect(() => {
    loadAll();
  }, [userPhone, userRole]);

  const handleAiDiagnose = async (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;
    setLoadingAi(true);
    try {
      const res = await getAiRecommendation(problemDescription);
      setRecommendation(res.data);
      const match = providersList.find(p => p.category?.toLowerCase() === res.data?.category?.toLowerCase());
      if (match) setSelectedProviderPhone(match.phone);
    } catch {
      setBanner('AI Diagnosis unavailable. Check backend on port 8081.');
    } finally {
      setLoadingAi(false);
    }
  };

  const finalizeBooking = async (providerObj, desc, amount, methodUsed, paymentRefId = '') => {
    await createServiceRequest({
      problemDescription: paymentRefId ? `${desc} [Razorpay ID: ${paymentRefId}]` : desc,
      category: providerObj.category,
      customerPhone: userPhone,
      customerName: profile?.fullName || '',
      customerAddress: profile?.address || '',
      customerCity: profile?.city || '',
      providerPhone: providerObj.phone,
      providerName: providerObj.fullName,
      price: amount,
      paymentMethod: methodUsed
    });
    setProblemDescription('');
    setRecommendation(null);
    setFallbackCheckout(null);
    setSection('BOOKINGS');
    loadAll();
  };

  const openRazorpaySandbox = (providerObj, desc, amount) => {
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (typeof window.Razorpay === 'undefined' || !rzpKey) {
      setFallbackCheckout({ providerObj, desc, amount });
      return;
    }

    const options = {
      key: rzpKey,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'Fixora Home Care',
      description: `${providerObj.category} — ${desc}`,
      prefill: {
        name: profile?.fullName || '',
        email: profile?.email || '',
        contact: userPhone
      },
      theme: { color: '#EA580C' },
      handler: async function (response) {
        const payId = response.razorpay_payment_id || 'rzp_verified';
        await finalizeBooking(providerObj, desc, amount, 'RAZORPAY_UPI', payId);
        setBanner(`Razorpay Payment Confirmed (${payId})! ₹${amount} held in Escrow for ${providerObj.fullName}.`);
      },
      modal: {
        ondismiss: function () {
          setBanner('Razorpay checkout closed before payment.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setBanner(`Razorpay Payment Failed: ${resp.error?.description || 'Try again'}`);
      });
      rzp.open();
    } catch {
      setFallbackCheckout({ providerObj, desc, amount });
    }
  };

  const handleBookService = async (chosenProvider, customProblem, customPrice) => {
    const providerObj = chosenProvider || providersList.find(p => p.phone === selectedProviderPhone) || providersList[0];
    if (!providerObj) {
      setBanner('No registered specialists found in database. Register a Provider account first.');
      return;
    }

    const amount = customPrice || providerObj.hourlyRate || 399;
    const desc = customProblem || problemDescription || `Doorstep ${providerObj.category} service`;

    if (paymentMode === 'COD') {
      await finalizeBooking(providerObj, desc, amount, 'COD');
      setBanner(`Booked ${providerObj.fullName} via Cash on Delivery (₹${amount}).`);
      return;
    }

    openRazorpaySandbox(providerObj, desc, amount);
  };

  const handleBookPackage = (pkg) => {
    const matchedProvider =
      providersList.find(p => p.category?.toLowerCase().includes(pkg.category?.toLowerCase())) ||
      providersList[0];
    handleBookService(matchedProvider, `${pkg.title} (${pkg.duration})`, pkg.price);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setBanner('Enter a valid withdrawal amount greater than ₹0.');
      return;
    }
    try {
      const res = await withdrawWallet(userPhone, amt);
      setProfile(res.data);
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setBanner(`Withdrew ₹${amt} to ${withdrawUpiOrBank}. Updated wallet: ₹${res.data.walletBalance}.`);
    } catch (err) {
      setBanner(err?.response?.data || 'Withdrawal failed. Check your wallet balance.');
    }
  };

  const handleProviderAction = async (bookingId, action) => {
    try {
      await respondToRequest(bookingId, action);
      setBanner(`Booking #${bookingId} marked as ${action}.`);
      loadAll();
    } catch {
      setBanner('Failed to update job status.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await updateUserProfile(userPhone, profile);
      setProfile(res.data);
      setBanner('Profile & doorstep address updated in database!');
      setSection('HOME');
    } catch {
      setBanner('Failed to update profile.');
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim() || !reviewForm.serviceCategory) return;
    try {
      await addReview({
        customerName: profile?.fullName || userPhone,
        serviceCategory: reviewForm.serviceCategory,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      setReviewForm({ serviceCategory: '', rating: 5, comment: '' });
      setBanner('Review saved to database!');
      loadAll();
    } catch {
      setBanner('Could not publish review.');
    }
  };

  const filteredProviders = providersList.filter((p) => {
    const matchesCat =
      selectedCategoryFilter === 'ALL' ||
      p.category?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const activeCount = bookings.filter(b => b.status === 'ACCEPTED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const declinedCount = bookings.filter(b => b.status === 'DECLINED').length;
  const maxBar = Math.max(1, pendingCount, activeCount, completedCount, declinedCount);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 36px', position: 'relative' }}>
      <MotionVideoBackdrop variant={userRole === 'PROVIDER' ? 'provider' : 'customer'} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="glass-window"
        style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px 34px', position: 'relative', zIndex: 2 }}
      >
        <FixoraNavbar
          userRole={userRole}
          profile={profile}
          activeSection={section}
          onSelectSection={setSection}
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onLogout={onLogout}
        />

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ padding: '13px 18px', marginBottom: '20px', borderRadius: '16px', background: 'rgba(255, 247, 237, 0.94)', border: '1px solid #FDBA74', color: '#9A3412', fontWeight: '700', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>✓ {banner}</span>
              <button onClick={() => setBanner('')} style={{ background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdraw Modal */}
        <AnimatePresence>
          {withdrawOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.58)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '420px', padding: '28px', background: 'rgba(255,252,248,0.96)' }}
              >
                <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800' }}>Withdraw from Wallet</h3>
                <p style={{ fontSize: '12.5px', color: '#57534E', marginTop: 0 }}>
                  Available Balance: <strong>₹{(profile?.walletBalance ?? 0).toFixed(0)}</strong>
                </p>
                <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Amount (₹)</label>
                    <input type="number" className="glass-input" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min="1" required />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>UPI ID / Bank Account</label>
                    <input type="text" className="glass-input" placeholder="Enter your UPI ID or account" value={withdrawUpiOrBank} onChange={(e) => setWithdrawUpiOrBank(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="dialer-btn" style={{ flex: 1 }}>
                      <span className="dialer-btn-inner" style={{ width: '100%' }}>Confirm Withdrawal</span>
                    </motion.button>
                    <button type="button" onClick={() => setWithdrawOpen(false)} style={{ padding: '10px 16px', borderRadius: '999px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Checkout Modal if VITE_RAZORPAY_KEY is not set */}
        <AnimatePresence>
          {fallbackCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.58)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '430px', padding: '28px', background: 'rgba(255,252,248,0.97)' }}
              >
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C' }}>ESCROW CHECKOUT</div>
                <h3 style={{ margin: '6px 0', fontSize: '24px', fontWeight: '800' }}>Pay ₹{fallbackCheckout.amount}</h3>
                <p style={{ fontSize: '13px', color: '#44403C' }}>
                  Specialist: <strong>{fallbackCheckout.providerObj.fullName}</strong> • Doorstep: <strong>{profile?.address || 'Not set'}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={async () => {
                      const { providerObj, desc, amount } = fallbackCheckout;
                      await finalizeBooking(providerObj, desc, amount, 'RAZORPAY_UPI', 'rzp_escrow_verified');
                      setBanner(`Paid ₹${amount}! Track your booking below.`);
                    }}
                    className="dialer-btn"
                    style={{ flex: 1 }}
                  >
                    <span className="dialer-btn-inner" style={{ width: '100%' }}>Confirm Payment (₹{fallbackCheckout.amount})</span>
                  </motion.button>
                  <button type="button" onClick={() => setFallbackCheckout(null)} style={{ padding: '10px 16px', borderRadius: '999px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: MANAGE PROFILE */}
        {section === 'PROFILE' && profile ? (
          <DropletReveal>
            <div className="glass-panel" style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', fontWeight: '800' }}>
                {userRole === 'PROVIDER' ? 'Manage Specialist Profile' : 'Manage Profile & Doorstep Address'}
              </h2>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Full Name</label>
                  <input className="glass-input" value={profile.fullName || ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Email Address</label>
                    <input className="glass-input" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>City / Zone</label>
                    <input className="glass-input" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Doorstep Address</label>
                  <input className="glass-input" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
                {userRole === 'PROVIDER' && (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Trade Specialty</label>
                      <select className="glass-input" value={profile.category || ''} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="AC & Appliance">AC & Appliance</option>
                        <option value="Cleaning">Cleaning</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Professional Bio</label>
                      <input className="glass-input" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                    </div>
                  </>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="dialer-btn" style={{ marginTop: '8px' }}>
                  <span className="dialer-btn-inner" style={{ width: '100%' }}>Save Changes</span>
                </motion.button>
              </form>
            </div>
          </DropletReveal>
        ) : section === 'BOOKINGS' && userRole === 'CUSTOMER' ? (
          /* SECTION 2: TRACK ACTIVE BOOKINGS FOR CUSTOMER */
          <DropletReveal>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Track My Bookings & Escrow ({bookings.length})</h2>
                  <span style={{ fontSize: '12.5px', color: '#57534E' }}>Live status fetched from database</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSection('HOME')}
                  style={{ padding: '9px 16px', borderRadius: '999px', border: '1px solid rgba(28,25,23,0.16)', background: '#FFF', fontWeight: '700', cursor: 'pointer', fontSize: '12.5px' }}
                >
                  ← Back to Services
                </button>
              </div>
              {bookings.length === 0 ? (
                <p style={{ fontSize: '13.5px', color: '#57534E' }}>No bookings found in database for {userPhone}.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                  {bookings.map((b) => (
                    <div key={b.id} style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(28,25,23,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>#{b.id} • {b.providerName}</strong>
                        <span style={{
                          fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '99px',
                          background: b.status === 'DECLINED' ? '#FEE2E2' : b.status === 'ACCEPTED' ? '#FFEDD5' : b.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7',
                          color: b.status === 'DECLINED' ? '#991B1B' : b.status === 'ACCEPTED' ? '#9A3412' : b.status === 'COMPLETED' ? '#166534' : '#92400E'
                        }}>
                          {b.status}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#1C1917' }}>{b.problemDescription}</p>
                      <div style={{ fontSize: '12px', color: '#57534E', fontWeight: '700' }}>
                        ₹{b.price} • {b.paymentMethod} • {b.paymentStatus}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropletReveal>
        ) : userRole === 'CUSTOMER' ? (
          /* SECTION 3: DATABASE-DRIVEN CUSTOMER STOREFRONT */
          <div>
            {/* A. Hero + Search + AI Symptom Diagnosis */}
            <DropletReveal>
              <div style={{
                borderRadius: '26px',
                background: 'linear-gradient(125deg, #1C1917 0%, #292524 58%, #9A3412 100%)',
                border: '1px solid rgba(251,146,60,0.35)',
                padding: '32px 36px',
                color: '#FAFAF9',
                marginBottom: '26px',
                boxShadow: '0 20px 46px rgba(28,25,23,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '99px', background: 'rgba(249,115,22,0.22)', color: '#FDBA74', fontSize: '12px', fontWeight: '700' }}>
                    <Sparkles size={14} /> Doorstep: {profile?.address || 'Update your address in Manage Profile'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '4px', borderRadius: '999px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('RAZORPAY_UPI')}
                      className="role-tab"
                      style={{
                        padding: '7px 14px',
                        fontSize: '12px',
                        background: paymentMode === 'RAZORPAY_UPI' ? '#EA580C' : 'transparent',
                        color: '#FFF'
                      }}
                    >
                      <CreditCard size={13} /> Razorpay UPI/Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD')}
                      className="role-tab"
                      style={{
                        padding: '7px 14px',
                        fontSize: '12px',
                        background: paymentMode === 'COD' ? '#EA580C' : 'transparent',
                        color: '#FFF'
                      }}
                    >
                      <Banknote size={13} /> Cash on Delivery
                    </button>
                  </div>
                </div>

                <h1 style={{ margin: '0 0 12px 0', fontSize: '34px', fontWeight: '800' }}>
                  Hi {profile?.fullName || userPhone}, <span className="serif-italic" style={{ fontSize: '40px', fontWeight: '400', color: '#FB923C' }}>elevate</span> your everyday living.
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginTop: '16px' }}>
                  <form onSubmit={handleAiDiagnose} style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.96)', padding: '5px', borderRadius: '999px' }}>
                    <input
                      type="text"
                      placeholder="Describe issue for AI Diagnosis..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', padding: '9px 16px', fontSize: '13.5px', outline: 'none', color: '#1C1917' }}
                    />
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} type="submit" className="dialer-btn" disabled={loadingAi}>
                      <span className="dialer-btn-inner" style={{ padding: '9px 18px', fontSize: '12.5px' }}>{loadingAi ? 'Diagnosing...' : 'AI Diagnose'}</span>
                    </motion.button>
                  </form>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.92)', padding: '5px 16px', borderRadius: '999px' }}>
                    <Search size={16} color="#78716C" />
                    <input
                      type="text"
                      placeholder="Search specialists or trades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', padding: '9px 4px', fontSize: '13.5px', outline: 'none', color: '#1C1917' }}
                    />
                  </div>
                </div>

                {recommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '16px', background: 'rgba(28,25,23,0.92)', padding: '16px 20px', borderRadius: '18px', border: '1px solid #FB923C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', background: '#F97316', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>
                        AI MATCH: {recommendation.category} ({recommendation.confidence}) • {recommendation.urgency}
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#FED7AA' }}>{recommendation.matchReason}</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleBookService(null, problemDescription, recommendation.estimatedPrice)} className="dialer-btn">
                      <span className="dialer-btn-inner">Book Now (₹{recommendation.estimatedPrice})</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </DropletReveal>

            {/* B. Category Filter Tiles */}
            <DropletReveal delay={0.05}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '800' }}>Explore Home Services</h2>
                {selectedCategoryFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('ALL')}
                    style={{ background: 'none', border: 'none', color: '#EA580C', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Show All Categories
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                {CATEGORY_TILES.map((cat) => {
                  const IconComp = cat.icon;
                  const active = selectedCategoryFilter === cat.id;
                  return (
                    <motion.div
                      key={cat.id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategoryFilter(active ? 'ALL' : cat.id)}
                      className="glass-panel"
                      style={{
                        padding: '18px 16px',
                        cursor: 'pointer',
                        border: active ? '2px solid #EA580C' : '1px solid rgba(255,255,255,0.85)',
                        background: active ? 'rgba(255,247,237,0.92)' : 'rgba(255,253,250,0.74)'
                      }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(249,115,22,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <IconComp size={21} color={cat.color} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1C1917' }}>{cat.title}</div>
                    </motion.div>
                  );
                })}
              </div>
            </DropletReveal>

            {/* C. Database-Fetched Service Packages (From MySQL `service_packages`) */}
            {packagesList.length > 0 && (
              <DropletReveal delay={0.08}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '21px', fontWeight: '800' }}>Service Packages</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {packagesList
                    .filter(pkg => selectedCategoryFilter === 'ALL' || pkg.category?.toLowerCase().includes(selectedCategoryFilter.toLowerCase()))
                    .map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ y: -5 }}
                        className="glass-panel"
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            {pkg.badge && (
                              <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(249,115,22,0.15)', color: '#C2410C' }}>
                                {pkg.badge}
                              </span>
                            )}
                            {pkg.duration && (
                              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#57534E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {pkg.duration}
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: '4px 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#1C1917' }}>{pkg.title}</h4>
                          {pkg.rating && <div style={{ fontSize: '12px', color: '#EA580C', fontWeight: '700', marginBottom: '12px' }}>★ {pkg.rating}</div>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(28,25,23,0.08)' }}>
                          <div>
                            <span style={{ fontSize: '17px', fontWeight: '800', color: '#1C1917' }}>₹{pkg.price}</span>{' '}
                            {pkg.oldPrice && <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#78716C' }}>₹{pkg.oldPrice}</span>}
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button" onClick={() => handleBookPackage(pkg)} className="dialer-btn">
                            <span className="dialer-btn-inner" style={{ padding: '8px 16px', fontSize: '12px' }}>Book</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </DropletReveal>
            )}

            {/* D. Verified Specialists (Fetched from MySQL `users` table) + Live Reviews (Fetched from MySQL `reviews` table) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.95fr', gap: '26px' }}>
              <DropletReveal delay={0.12}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '21px', fontWeight: '800' }}>
                  Verified Specialists ({filteredProviders.length})
                </h2>
                {filteredProviders.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '24px', color: '#57534E', fontSize: '13.5px' }}>
                    No specialists found in the database for this filter. Register a Service Provider account to see them listed here automatically.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {filteredProviders.map((prov) => {
                      const isPlumber = prov.category === 'Plumber';
                      const isElec = prov.category === 'Electrician';
                      const fee = prov.hourlyRate || 399;
                      return (
                        <motion.div
                          key={prov.id}
                          whileHover={{ y: -5 }}
                          className="glass-panel"
                          style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(249,115,22,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isPlumber ? <Wrench size={20} color="#EA580C" /> : isElec ? <Zap size={20} color="#D97706" /> : <Hammer size={20} color="#C2410C" />}
                              </div>
                              <span style={{ fontSize: '17px', fontWeight: '800', color: '#EA580C' }}>₹{fee}</span>
                            </div>
                            <h4 style={{ margin: '12px 0 4px 0', fontSize: '17px', fontWeight: '800' }}>{prov.fullName}</h4>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 9px', borderRadius: '99px', background: 'rgba(28,25,23,0.07)' }}>
                              {prov.category} • ★ {prov.rating ?? 5.0} ({prov.completedJobs ?? 0} jobs)
                            </span>
                            <p style={{ fontSize: '12px', color: '#57534E', margin: '10px 0 14px 0' }}>{prov.bio || ''}</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} type="button" onClick={() => handleBookService(prov, null, fee)} className="dialer-btn" style={{ width: '100%' }}>
                            <span className="dialer-btn-inner" style={{ width: '100%', padding: '9px 14px', fontSize: '12px' }}>
                              {paymentMode === 'COD' ? `Book (${prov.fullName.split(' ')[0]}) • COD` : `Pay ₹${fee} via Razorpay`}
                            </span>
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </DropletReveal>

              <DropletReveal delay={0.16}>
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} color="#F97316" fill="#F97316" /> Customer Reviews ({reviews.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '230px', overflowY: 'auto', marginBottom: '16px' }}>
                    {reviews.length === 0 ? (
                      <p style={{ fontSize: '12.5px', color: '#57534E' }}>No reviews in database yet. Be the first to post one below!</p>
                    ) : (
                      reviews.map((rev, idx) => (
                        <div key={rev.id || idx} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.78)', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                            <span>{rev.customerName} ({rev.serviceCategory})</span>
                            <span style={{ color: '#EA580C' }}>{'★'.repeat(rev.rating || 5)}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', color: '#44403C' }}>{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select className="glass-input" style={{ padding: '8px 12px', fontSize: '12px' }} value={reviewForm.serviceCategory} onChange={(e) => setReviewForm({ ...reviewForm, serviceCategory: e.target.value })} required>
                        <option value="">Select Category</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="AC & Appliance">AC & Appliance</option>
                        <option value="Cleaning">Cleaning</option>
                      </select>
                      <select className="glass-input" style={{ padding: '8px 12px', fontSize: '12px' }} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                        <option value="5">★★★★★ (5.0)</option>
                        <option value="4">★★★★☆ (4.0)</option>
                        <option value="3">★★★☆☆ (3.0)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="glass-input" style={{ padding: '8px 14px', fontSize: '12px' }} placeholder="Write a review..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="submit" className="dialer-btn">
                        <span className="dialer-btn-inner" style={{ padding: '8px 14px', fontSize: '12px' }}>Post</span>
                      </motion.button>
                    </div>
                  </form>
                </div>
              </DropletReveal>
            </div>
          </div>
        ) : (
          /* SECTION 4: SERVICE PROVIDER PORTAL (100% DB-DRIVEN) */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '26px' }}>
              <div className="dark-glass-panel" style={{ padding: '22px' }}>
                <span style={{ fontSize: '11px', color: '#FDBA74', fontWeight: '800' }}>PROVIDER WALLET BALANCE</span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#FB923C' }}>₹{(profile?.walletBalance ?? 0).toFixed(0)}</h2>
              </div>
              <div className="glass-panel" style={{ padding: '22px', borderTop: '4px solid #F59E0B' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>PENDING REQUESTS</span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#D97706' }}>{pendingCount}</h2>
              </div>
              <div className="glass-panel" style={{ padding: '22px', borderTop: '4px solid #EA580C' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>ACTIVE ACCEPTED JOBS</span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#EA580C' }}>{activeCount}</h2>
              </div>
              <div className="glass-panel" style={{ padding: '22px', borderTop: '4px solid #16A34A' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>COMPLETED WORKS</span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#15803D' }}>{completedCount}</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.95fr', gap: '26px' }}>
              <div className="glass-panel" style={{ padding: '26px' }}>
                <h3 style={{ marginTop: 0, fontSize: '19px', fontWeight: '800' }}>
                  Customer Dispatch Queue for {profile?.fullName || userPhone} ({bookings.length})
                </h3>
                {bookings.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#57534E' }}>No bookings assigned to {userPhone} in database yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {bookings.map((job) => (
                      <div key={job.id} style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(28,25,23,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div>
                          <strong>Booking #{job.id} • {job.customerName || job.customerPhone}</strong>{' '}
                          <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 9px', borderRadius: '99px', background: '#FFEDD5', color: '#9A3412' }}>{job.status}</span>
                          <p style={{ margin: '6px 0', fontSize: '13px' }}>{job.problemDescription}</p>
                          <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={14} color="#EA580C" />
                            Doorstep: {job.customerAddress || 'Address not provided'} {job.customerCity ? `(${job.customerCity})` : ''} • Phone: {job.customerPhone}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {job.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleProviderAction(job.id, 'ACCEPT')} className="dialer-btn">
                                <span className="dialer-btn-inner" style={{ padding: '9px 14px', fontSize: '12px' }}><Check size={14} /> Accept (+₹{job.price})</span>
                              </button>
                              <button onClick={() => handleProviderAction(job.id, 'DECLINE')} style={{ padding: '10px 14px', borderRadius: '999px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                                <XCircle size={14} /> Decline
                              </button>
                            </>
                          )}
                          {job.status === 'ACCEPTED' && (
                            <button onClick={() => handleProviderAction(job.id, 'COMPLETE')} className="dialer-btn">
                              <span className="dialer-btn-inner" style={{ padding: '9px 16px', fontSize: '12px' }}>Mark Work Completed</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#EA580C" /> Work & Earnings Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'end', height: '140px', padding: '12px', background: 'rgba(255,255,255,0.68)', borderRadius: '16px' }}>
                  {[
                    { label: 'Pending', count: pendingCount, color: '#F59E0B' },
                    { label: 'Active', count: activeCount, color: '#EA580C' },
                    { label: 'Done', count: completedCount, color: '#16A34A' },
                    { label: 'Declined', count: declinedCount, color: '#EF4444' }
                  ].map((bar) => (
                    <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>{bar.count}</span>
                      <div style={{ width: '100%', height: `${Math.max(14, (bar.count / maxBar) * 85)}%`, background: bar.color, borderRadius: '8px 8px 4px 4px' }} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#57534E', marginTop: '6px' }}>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <FixoraFooter onSelectCategory={(cat) => { setSection('HOME'); setSelectedCategoryFilter(cat); }} />
      </motion.div>
    </div>
  );
}