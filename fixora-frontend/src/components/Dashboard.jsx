import React, { useState, useEffect, useCallback } from 'react';
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
  getProvidersByService,
  withdrawWallet,
  getAllReviews,
  addReview,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../services/api';
import FixoraNavbar from './FixoraNavbar';
import FixoraFooter from './FixoraFooter';
import { MechanicalToolsBackdrop, DropletReveal } from './MotionPrimitives';
import {
  Sparkles,
  CreditCard,
  Star,
  Banknote,
  ArrowLeft,
  UserX,
  BarChart3,
  XCircle,
  Check,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Home,
  Wrench,
  CalendarCheck,
  Gift,
  CheckCircle2
} from 'lucide-react';

const HERO_SERVICES = [
  {
    id: 'Plumber',
    label: 'Plumber & Pipe Care',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Electrician',
    label: 'Electrician & Wiring',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Carpenter',
    label: 'Carpenter & Woodwork',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'AC & Appliance',
    label: 'AC & Appliance Repair',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Cleaning',
    label: 'Cleaning & Pest Control',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Painting',
    label: 'Painting & Waterproofing',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Beauty',
    label: "Women's Salon & Spa",
    group: 'BEAUTY',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'Laptop Repair',
    label: 'Laptop & Smart Lock Care',
    group: 'HOMES',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80'
  }
];

const SPOTLIGHT_BANNERS = [
  {
    id: 'Painting',
    tag: 'Painting & waterproofing',
    title: 'Fresh look. Lasting finish.',
    subtitle: 'With 1-year warranty',
    bg: 'linear-gradient(115deg, rgba(234, 227, 210, 0.88) 0%, rgba(217, 206, 184, 0.88) 100%)',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=650&q=80'
  },
  {
    id: 'Cleaning',
    tag: 'Full-home cleaning',
    title: 'Cleaner homes. Zero hassle.',
    subtitle: 'Deep sofa, kitchen & bath care',
    bg: 'linear-gradient(115deg, rgba(239, 229, 220, 0.88) 0%, rgba(223, 203, 185, 0.88) 100%)',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=650&q=80'
  },
  {
    id: 'AC & Appliance',
    tag: 'AC & cooling care',
    title: 'Peak cooling. Lower bills.',
    subtitle: 'Foam-jet service & gas check',
    bg: 'linear-gradient(115deg, rgba(226, 232, 240, 0.88) 0%, rgba(203, 213, 225, 0.88) 100%)',
    image: 'https://images.unsplash.com/photo-1631545806609-35d4ae440431?auto=format&fit=crop&w=650&q=80'
  },
  {
    id: 'Plumber',
    tag: '24x7 Rapid Plumbing',
    title: 'Zero leaks. Fast dispatch.',
    subtitle: 'Taps, pipes & bathroom fittings',
    bg: 'linear-gradient(115deg, rgba(245, 235, 224, 0.88) 0%, rgba(227, 213, 202, 0.88) 100%)',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=650&q=80'
  },
  {
    id: 'Electrician',
    tag: 'Certified Electricians',
    title: 'Safe wiring. Instant fixes.',
    subtitle: 'MCB, inverters & smart switches',
    bg: 'linear-gradient(115deg, rgba(254, 243, 199, 0.88) 0%, rgba(253, 230, 138, 0.88) 100%)',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=650&q=80'
  }
];

const NOTEWORTHY_CARDS = [
  {
    id: 'Cleaning',
    title: 'Full Home / By Room Cleaning',
    badge: '',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Painting',
    title: 'Home Painting',
    badge: '',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'AC & Appliance',
    title: 'AC Service & Repair',
    badge: '3-year warranty',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Plumber',
    title: 'Bathroom Fittings & Pipe Care',
    badge: '',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Laptop Repair',
    title: 'Laptop Repair',
    badge: '',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Beauty',
    title: 'Spa Ayurveda & Salon',
    badge: '',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Electrician',
    title: 'Smart Home & Wiring Setup',
    badge: '',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'Carpenter',
    title: 'Custom Furniture & Locks',
    badge: '',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80'
  }
];

export default function Dashboard({ userSession, onLogout }) {
  const userPhone = userSession?.phone || '';
  const userRole = userSession?.role || 'CUSTOMER';

  const [section, setSection] = useState('HOME');
  const [activeDockTab, setActiveDockTab] = useState('UC');
  const [activeServiceCategory, setActiveServiceCategory] = useState(null);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loadingServiceProviders, setLoadingServiceProviders] = useState(false);

  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({
    phone: userPhone,
    role: userRole,
    fullName: '',
    email: '',
    address: '',
    city: 'Howrah, Kolkata',
    category: 'Plumber',
    bio: '',
    walletBalance: 0
  });
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

  useEffect(() => {
    if (pauseCarousel || userRole !== 'CUSTOMER' || section !== 'HOME') return;
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_BANNERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [pauseCarousel, userRole, section]);

  const loadAll = useCallback(async () => {
    if (!userPhone) return;
    try {
      const [profRes, provRes, pkgRes, revRes, reqRes] = await Promise.all([
        getUserProfile(userPhone, userRole).catch(() => ({ data: null })),
        getAllMarketplaceProviders().catch(() => ({ data: [] })),
        getServicePackages().catch(() => ({ data: [] })),
        getAllReviews().catch(() => ({ data: [] })),
        (userRole === 'CUSTOMER' ? getCustomerRequests(userPhone) : getProviderRequests(userPhone)).catch(() => ({ data: [] }))
      ]);

      if (profRes?.data) {
        setProfile((prev) => ({ ...prev, ...profRes.data }));
      }

      const provData = provRes?.data || [];
      setProvidersList(provData);
      if (provData.length > 0) {
        setSelectedProviderPhone((prev) => prev || provData[0].phone);
      }

      setPackagesList(pkgRes?.data || []);
      setReviews(revRes?.data || []);
      setBookings(reqRes?.data || []);
    } catch (e) {
      console.error('Database sync error:', e);
    }
  }, [userPhone, userRole]);

  useEffect(() => {
    if (!userPhone) return;
    let isMounted = true;

    const syncInitialData = async () => {
      const [profRes, provRes, pkgRes, revRes, reqRes] = await Promise.all([
        getUserProfile(userPhone, userRole).catch(() => ({ data: null })),
        getAllMarketplaceProviders().catch(() => ({ data: [] })),
        getServicePackages().catch(() => ({ data: [] })),
        getAllReviews().catch(() => ({ data: [] })),
        (userRole === 'CUSTOMER' ? getCustomerRequests(userPhone) : getProviderRequests(userPhone)).catch(() => ({ data: [] }))
      ]);

      if (!isMounted) return;

      if (profRes?.data) {
        setProfile((prev) => ({ ...prev, ...profRes.data }));
      }

      const provData = provRes?.data || [];
      setProvidersList(provData);
      if (provData.length > 0) {
        setSelectedProviderPhone((prev) => prev || provData[0].phone);
      }

      setPackagesList(pkgRes?.data || []);
      setReviews(revRes?.data || []);
      setBookings(reqRes?.data || []);
    };

    syncInitialData();
    return () => {
      isMounted = false;
    };
  }, [userPhone, userRole]);

  const handleNavbarSelect = (target) => {
    setSection(target);
    if (target === 'HOME') {
      setActiveServiceCategory(null);
      setActiveDockTab('UC');
    } else if (target === 'BOOKINGS') {
      setActiveDockTab('BOOKINGS');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServicePage = async (categoryName) => {
    setActiveServiceCategory(categoryName);
    setSection('SERVICE_DETAIL');
    setLoadingServiceProviders(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await getProvidersByService(categoryName);
      setServiceProviders(res.data || []);
    } catch {
      const fallback = providersList.filter(
        (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
      );
      setServiceProviders(fallback);
    } finally {
      setLoadingServiceProviders(false);
    }
  };

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
      customerName: profile?.fullName || userPhone,
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
    setActiveDockTab('BOOKINGS');
    loadAll();
  };

  const openRazorpaySandbox = async (providerObj, desc, amount) => {
    if (typeof window.Razorpay === 'undefined') {
      setFallbackCheckout({ providerObj, desc, amount });
      return;
    }

    try {
      const orderRes = await createRazorpayOrder(amount);
      const { orderId, amount: amountPaise, currency, keyId } = orderRes.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountPaise,
        currency: currency || 'INR',
        name: 'Fixora Home Care',
        description: `${providerObj.category} — ${desc}`,
        order_id: orderId,
        prefill: {
          name: profile?.fullName || '',
          email: profile?.email || '',
          contact: userPhone
        },
        theme: { color: '#EA580C' },
        handler: async function (response) {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            const payId = response.razorpay_payment_id || 'rzp_verified';
            await finalizeBooking(providerObj, desc, amount, 'RAZORPAY_UPI', payId);
            setBanner(`Razorpay Payment Verified (${payId})! ₹${amount} held in Escrow for ${providerObj.fullName}.`);
          } catch {
            setBanner('Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            setBanner('Razorpay checkout closed before payment.');
          }
        }
      };

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
      setProfile((prev) => ({ ...prev, ...res.data }));
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
    try {
      const res = await updateUserProfile(userPhone, profile);
      if (res?.data) setProfile((prev) => ({ ...prev, ...res.data }));
      setBanner('Profile & doorstep address saved!');
      handleNavbarSelect('HOME');
    } catch {
      setBanner('Could not save profile to server. Check backend connection on port 8081.');
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

  const visibleSpotlights = [0, 1, 2].map(
    (offset) => SPOTLIGHT_BANNERS[(spotlightIndex + offset) % SPOTLIGHT_BANNERS.length]
  );

  const visibleHeroServices = HERO_SERVICES.filter((item) => {
    const matchesDock =
      activeDockTab === 'UC' ||
      (activeDockTab === 'HOMES' && item.group === 'HOMES') ||
      (activeDockTab === 'BEAUTY' && item.group === 'BEAUTY');
    const matchesSearch =
      !searchQuery.trim() ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDock && matchesSearch;
  });

  const visibleNoteworthy = NOTEWORTHY_CARDS.filter((item) => {
    if (!searchQuery.trim()) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const activeCount = bookings.filter(b => b.status === 'ACCEPTED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const declinedCount = bookings.filter(b => b.status === 'DECLINED').length;
  const maxBar = Math.max(1, pendingCount, activeCount, completedCount, declinedCount);

  return (
    <div style={{ minHeight: '100vh', color: '#1C1917', paddingBottom: '104px', position: 'relative' }}>
      {/* Live Moving Mechanical Tools & Interlocking Gears Background */}
      <MechanicalToolsBackdrop />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <FixoraNavbar
          userRole={userRole}
          profile={profile}
          activeSection={section === 'SERVICE_DETAIL' ? 'HOME' : section}
          onSelectSection={handleNavbarSelect}
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onLogout={onLogout}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (section !== 'HOME') setSection('HOME');
          }}
        />

        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 32px' }}>
          <AnimatePresence>
            {banner && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="skiper-glass-card"
                style={{
                  padding: '13px 18px',
                  marginBottom: '22px',
                  borderColor: '#FDBA74',
                  color: '#9A3412',
                  fontWeight: '700',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
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
                style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.52)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  className="skiper-glass-section"
                  style={{ width: '100%', maxWidth: '420px', padding: '28px', background: 'rgba(255,255,255,0.92)' }}
                >
                  <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800' }}>Withdraw from Wallet</h3>
                  <p style={{ fontSize: '13px', color: '#57534E', marginTop: 0 }}>
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
                      <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer' }}>
                        Confirm Withdrawal
                      </button>
                      <button type="button" onClick={() => setWithdrawOpen(false)} style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fallback Checkout Modal */}
          <AnimatePresence>
            {fallbackCheckout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.52)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  className="skiper-glass-section"
                  style={{ width: '100%', maxWidth: '430px', padding: '28px', background: 'rgba(255,255,255,0.92)' }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C' }}>ESCROW CHECKOUT</div>
                  <h3 style={{ margin: '6px 0', fontSize: '24px', fontWeight: '800' }}>Pay ₹{fallbackCheckout.amount}</h3>
                  <p style={{ fontSize: '13px', color: '#44403C' }}>
                    Specialist: <strong>{fallbackCheckout.providerObj.fullName}</strong> • Doorstep: <strong>{profile?.address || 'Not set'}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const { providerObj, desc, amount } = fallbackCheckout;
                        await finalizeBooking(providerObj, desc, amount, 'RAZORPAY_UPI', 'rzp_escrow_verified');
                        setBanner(`Paid ₹${amount}! Track your booking below.`);
                      }}
                      style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Confirm Payment (₹{fallbackCheckout.amount})
                    </button>
                    <button type="button" onClick={() => setFallbackCheckout(null)} style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIEW 1: EDIT PROFILE PAGE */}
          {section === 'PROFILE' ? (
            <div className="skiper-glass-section animista-entrance" style={{ maxWidth: '640px', margin: '12px auto 40px auto', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>
                  {userRole === 'PROVIDER' ? 'Edit Specialist Profile' : 'Edit Profile & Doorstep Address'}
                </h2>
                <button
                  type="button"
                  onClick={() => handleNavbarSelect('HOME')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Full Name</label>
                  <input className="glass-input" placeholder="Enter your full name" value={profile.fullName || ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>Email Address</label>
                    <input className="glass-input" placeholder="you@example.com" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700' }}>City / Zone</label>
                    <input className="glass-input" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Doorstep Address</label>
                  <input className="glass-input" placeholder="House No, Street, Landmark" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
                {userRole === 'PROVIDER' && (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Trade Specialty</label>
                      <select className="glass-input" value={profile.category || 'Plumber'} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="AC & Appliance">AC & Appliance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Painting">Painting</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Laptop Repair">Laptop Repair</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Professional Bio</label>
                      <input className="glass-input" placeholder="Years of experience & specialties" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                    </div>
                  </>
                )}
                <button type="submit" style={{ marginTop: '8px', padding: '12px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          ) : section === 'SERVICE_DETAIL' && userRole === 'CUSTOMER' ? (
            /* VIEW 2: DEDICATED SERVICE PROVIDERS PAGE */
            <div className="skiper-glass-section animista-entrance" style={{ padding: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '26px', paddingBottom: '18px', borderBottom: '1px solid rgba(28,25,23,0.1)' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Verified Category Specialists
                  </span>
                  <h1 style={{ margin: '4px 0 0 0', fontSize: '30px', fontWeight: '800', color: '#1C1917' }}>
                    {activeServiceCategory}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavbarSelect('HOME')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '12px', border: '1px solid #D6D3D1', background: '#FFFFFF', color: '#1C1917', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  <ArrowLeft size={15} /> Back to Home
                </button>
              </div>

              {loadingServiceProviders ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#57534E', fontWeight: '700' }}>
                  Fetching {activeServiceCategory} specialists...
                </div>
              ) : serviceProviders.length === 0 ? (
                <div
                  className="skiper-glass-card"
                  style={{
                    padding: '64px 24px',
                    textAlign: 'center',
                    border: '1px dashed rgba(234, 88, 12, 0.35)'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#FFF7ED', border: '1px solid #FDBA74', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <UserX size={30} color="#EA580C" />
                  </div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#1C1917' }}>
                    Here is no provider right now
                  </h2>
                  <p style={{ margin: '0 auto 22px auto', maxWidth: '440px', fontSize: '14px', color: '#57534E', lineHeight: 1.5 }}>
                    No specialists are currently available under <strong>{activeServiceCategory}</strong>. Please check back later or choose another service from the home screen.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleNavbarSelect('HOME')}
                    style={{ padding: '11px 22px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
                  >
                    Explore All Services
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                  {serviceProviders.map((prov) => {
                    const fee = prov.hourlyRate || 399;
                    return (
                      <div
                        key={prov.id || prov.phone}
                        className="skiper-glass-card animista-card-hover"
                        style={{
                          padding: '22px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#FFF7ED', color: '#C2410C' }}>
                              {prov.category}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#1C1917' }}>₹{fee}</span>
                          </div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>{prov.fullName}</h4>
                          <div style={{ fontSize: '12.5px', color: '#57534E', fontWeight: '700', marginBottom: '10px' }}>
                            ★ {prov.rating ?? 5.0} • {prov.completedJobs ?? 0} jobs • {prov.city || 'Kolkata'}
                          </div>
                          <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 18px 0' }}>
                            {prov.bio || `Background-verified ${prov.category} professional.`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBookService(prov, `${activeServiceCategory} Service`, fee)}
                          style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                        >
                          {paymentMode === 'COD' ? `Book ${prov.fullName.split(' ')[0]} • COD` : `Book Now • ₹${fee}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : section === 'BOOKINGS' && userRole === 'CUSTOMER' ? (
            /* VIEW 3: TRACK MY BOOKINGS */
            <div className="skiper-glass-section animista-entrance" style={{ padding: '30px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>My Bookings ({bookings.length})</h2>
                  <span style={{ fontSize: '13px', color: '#57534E' }}>Live booking & escrow status</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavbarSelect('HOME')}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #D6D3D1', background: '#FFF', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                >
                  ← Back to Home
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="skiper-glass-card" style={{ padding: '48px', textAlign: 'center', color: '#57534E' }}>
                  No bookings found yet. Select any service from the home screen to book!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                  {bookings.map((b) => (
                    <div key={b.id} className="skiper-glass-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>#{b.id} • {b.providerName}</strong>
                        <span style={{
                          fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '99px',
                          background: b.status === 'DECLINED' ? '#FEE2E2' : b.status === 'ACCEPTED' ? '#FFEDD5' : b.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7',
                          color: b.status === 'DECLINED' ? '#991B1B' : b.status === 'ACCEPTED' ? '#9A3412' : b.status === 'COMPLETED' ? '#166534' : '#92400E'
                        }}>
                          {b.status}
                        </span>
                      </div>
                      <p style={{ margin: '10px 0', fontSize: '13.5px', color: '#1C1917' }}>{b.problemDescription}</p>
                      <div style={{ fontSize: '12.5px', color: '#57534E', fontWeight: '700' }}>
                        ₹{b.price} • {b.paymentMethod} • {b.paymentStatus}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : section === 'REWARDS' && userRole === 'CUSTOMER' ? (
            /* VIEW 4: REWARDS & WALLET */
            <div className="skiper-glass-section animista-entrance" style={{ maxWidth: '680px', margin: '10px auto 40px auto', padding: '36px', textAlign: 'center' }}>
              <Gift size={38} color="#EA580C" style={{ marginBottom: '12px' }} />
              <h2 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800' }}>Fixora Rewards & Cashback</h2>
              <p style={{ color: '#57534E', fontSize: '14px', marginBottom: '20px' }}>
                Current Wallet Credits: <strong>₹{(profile?.walletBalance ?? 0).toFixed(0)}</strong> • Complete 3 bookings to unlock ₹150 instant credit!
              </p>
              <button
                type="button"
                onClick={() => handleNavbarSelect('HOME')}
                style={{ padding: '11px 22px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer' }}
              >
                Explore Services
              </button>
            </div>
          ) : userRole === 'CUSTOMER' ? (
            /* VIEW 5: SKIPER GLASSMORPHISM + ANIMISTA CUSTOMER DASHBOARD */
            <div>
              {/* SECTION A: Hero Grid + Right Promo & Promises in Glassmorphism */}
              <DropletReveal>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.15fr 0.85fr',
                    gap: '26px',
                    alignItems: 'start',
                    marginBottom: '42px'
                  }}
                >
                  {/* Left: Glassmorphism "What are you looking for?" Photo Cards */}
                  <div className="skiper-glass-section" style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1C1917' }}>
                        What are you looking for?
                      </h2>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setPaymentMode('RAZORPAY_UPI')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(28,25,23,0.12)',
                            background: paymentMode === 'RAZORPAY_UPI' ? '#1C1917' : 'rgba(255,255,255,0.8)',
                            color: paymentMode === 'RAZORPAY_UPI' ? '#FFFFFF' : '#57534E',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <CreditCard size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          Razorpay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMode('COD')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(28,25,23,0.12)',
                            background: paymentMode === 'COD' ? '#1C1917' : 'rgba(255,255,255,0.8)',
                            color: paymentMode === 'COD' ? '#FFFFFF' : '#57534E',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Banknote size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          COD
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                      {visibleHeroServices.map((srv, index) => (
                        <div
                          key={srv.id}
                          onClick={() => handleOpenServicePage(srv.id)}
                          className="animista-float animista-card-hover"
                          style={{
                            animationDelay: `${index * 0.22}s`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '6px',
                            borderRadius: '16px'
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              aspectRatio: '1.15 / 1',
                              borderRadius: '14px',
                              background: 'rgba(255,255,255,0.9)',
                              overflow: 'hidden',
                              marginBottom: '8px',
                              border: '1px solid rgba(255,255,255,0.95)',
                              boxShadow: '0 8px 20px rgba(28,25,23,0.06)'
                            }}
                          >
                            <img
                              src={srv.image}
                              alt={srv.label}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1C1917', lineHeight: 1.3 }}>
                            {srv.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* AI Smart Symptom Bar */}
                    <form
                      onSubmit={handleAiDiagnose}
                      style={{
                        marginTop: '22px',
                        paddingTop: '18px',
                        borderTop: '1px solid rgba(28,25,23,0.08)',
                        display: 'flex',
                        gap: '8px'
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(28,25,23,0.1)' }}>
                        <Sparkles size={15} color="#EA580C" />
                        <input
                          type="text"
                          placeholder="Not sure which service? Describe issue for AI Diagnosis..."
                          value={problemDescription}
                          onChange={(e) => setProblemDescription(e.target.value)}
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#1C1917' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loadingAi}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#1C1917',
                          color: '#FFFFFF',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {loadingAi ? 'Checking...' : 'AI Match'}
                      </button>
                    </form>

                    {recommendation && (
                      <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,247,237,0.94)', border: '1px solid #FDBA74', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '12.5px', color: '#9A3412' }}>
                          <strong>AI Match: {recommendation.category}</strong> — {recommendation.matchReason}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenServicePage(recommendation.category)}
                          style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', background: '#EA580C', color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Open {recommendation.category}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Promo Banner + Glassmorphism "Our promises" */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      onClick={() => handleOpenServicePage('Cleaning')}
                      className="animista-card-hover"
                      style={{
                        cursor: 'pointer',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: 'linear-gradient(120deg, rgba(2, 132, 199, 0.92) 0%, rgba(3, 105, 161, 0.92) 100%)',
                        backdropFilter: 'blur(14px)',
                        color: '#FFFFFF',
                        display: 'grid',
                        gridTemplateColumns: '1.15fr 0.85fr',
                        minHeight: '210px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 14px 32px rgba(2, 132, 199, 0.2)'
                      }}
                    >
                      <div style={{ padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-block', width: 'fit-content', padding: '4px 10px', borderRadius: '999px', background: '#1E293B', color: '#FDE047', fontSize: '12px', fontWeight: '800', marginBottom: '10px' }}>
                          ₹399 <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontWeight: '600' }}>₹549</span>
                        </span>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '900', lineHeight: 1.1, color: '#FEF08A' }}>
                          SCRUB & SHINE
                        </h3>
                        <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          BATHROOM & HOME CLEANING
                        </div>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80"
                        alt="Bathroom Cleaning"
                        className="animista-banner-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="skiper-glass-section" style={{ padding: '24px 26px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={16} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1C1917' }}>Our promises</h3>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#44403C' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Check size={16} color="#1C1917" /> Trained & experienced professionals
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Check size={16} color="#1C1917" /> Vetted & background-verified
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Check size={16} color="#1C1917" /> Transparent & fixed pricing
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Check size={16} color="#1C1917" /> Unconditional warranty on all repair jobs
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </DropletReveal>

              {/* SECTION B: Glassmorphic "In the spotlight" Auto-Sliding Banner Carousel */}
              <div
                onMouseEnter={() => setPauseCarousel(true)}
                onMouseLeave={() => setPauseCarousel(false)}
                className="skiper-glass-section"
                style={{ padding: '28px', marginBottom: '42px', position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1C1917', letterSpacing: '-0.5px' }}>
                    In the spotlight
                  </h2>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {SPOTLIGHT_BANNERS.map((b, idx) => (
                      <button
                        key={b.id}
                        type="button"
                        aria-label={`Slide ${idx + 1}`}
                        onClick={() => setSpotlightIndex(idx)}
                        style={{
                          width: spotlightIndex === idx ? '22px' : '8px',
                          height: '8px',
                          borderRadius: '999px',
                          border: 'none',
                          background: spotlightIndex === idx ? '#1C1917' : 'rgba(28,25,23,0.25)',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setSpotlightIndex((prev) => (prev - 1 + SPOTLIGHT_BANNERS.length) % SPOTLIGHT_BANNERS.length)
                    }
                    style={{
                      position: 'absolute',
                      left: '-16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.9)',
                      background: 'rgba(255,255,255,0.92)',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                    <AnimatePresence mode="popLayout">
                      {visibleSpotlights.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0.75, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.45 }}
                          onClick={() => handleOpenServicePage(item.id)}
                          className="animista-card-hover"
                          style={{
                            cursor: 'pointer',
                            borderRadius: '18px',
                            background: item.bg,
                            backdropFilter: 'blur(12px)',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateColumns: '1.15fr 0.85fr',
                            minHeight: '195px',
                            border: '1px solid rgba(255,255,255,0.75)'
                          }}
                        >
                          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#57534E', fontWeight: '600', marginBottom: '6px' }}>
                                {item.tag}
                              </div>
                              <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: '#1C1917', lineHeight: 1.2 }}>
                                {item.title}
                              </h3>
                              <div style={{ fontSize: '12px', color: '#44403C', fontWeight: '600' }}>
                                {item.subtitle}
                              </div>
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 'fit-content',
                                marginTop: '14px',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: '#1C1917',
                                color: '#FFFFFF',
                                fontSize: '12.5px',
                                fontWeight: '700'
                              }}
                            >
                              Book now
                            </span>
                          </div>
                          <img
                            src={item.image}
                            alt={item.tag}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_BANNERS.length)}
                    style={{
                      position: 'absolute',
                      right: '-16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.9)',
                      background: 'rgba(255,255,255,0.92)',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* SECTION C: Glassmorphic "New and noteworthy" Floating Photo Cards */}
              <div className="skiper-glass-section" style={{ padding: '28px', marginBottom: '42px' }}>
                <h2 style={{ margin: '0 0 22px 0', fontSize: '26px', fontWeight: '800', color: '#1C1917', letterSpacing: '-0.5px' }}>
                  New and noteworthy
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '22px' }}>
                  {visibleNoteworthy.map((card, index) => (
                    <div
                      key={card.title}
                      onClick={() => handleOpenServicePage(card.id)}
                      className="animista-float animista-card-hover"
                      style={{
                        animationDelay: `${index * 0.26}s`,
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '20px'
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.85)',
                          marginBottom: '10px',
                          boxShadow: '0 10px 24px rgba(28,25,23,0.08)',
                          border: '1px solid rgba(255,255,255,0.95)'
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {card.badge && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(28, 25, 23, 0.85)',
                              backdropFilter: 'blur(6px)',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: '700',
                              textAlign: 'center',
                              padding: '6px'
                            }}
                          >
                            {card.badge}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#1C1917', lineHeight: 1.35 }}>
                        {card.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: Database Packages (If Seeded) in Glassmorphism */}
              {packagesList.length > 0 && (
                <div className="skiper-glass-section" style={{ padding: '28px', marginBottom: '42px' }}>
                  <h2 style={{ margin: '0 0 18px 0', fontSize: '24px', fontWeight: '800' }}>Most booked packages</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                    {packagesList.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="skiper-glass-card animista-card-hover"
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      >
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C' }}>{pkg.category}</span>
                          <h4 style={{ margin: '6px 0', fontSize: '16px', fontWeight: '800' }}>{pkg.title}</h4>
                          <div style={{ fontSize: '12px', color: '#57534E', marginBottom: '12px' }}>
                            ★ {pkg.rating || '4.9'} • {pkg.duration}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(28,25,23,0.08)' }}>
                          <span style={{ fontSize: '17px', fontWeight: '800' }}>₹{pkg.price}</span>
                          <button
                            type="button"
                            onClick={() => handleBookPackage(pkg)}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Reviews Section in Glassmorphism */}
              <div className="skiper-glass-section" style={{ padding: '28px', marginBottom: '28px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={18} color="#EA580C" fill="#EA580C" /> Verified Customer Reviews ({reviews.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '210px', overflowY: 'auto' }}>
                    {reviews.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#57534E', margin: 0 }}>No reviews yet. Share your experience after booking!</p>
                    ) : (
                      reviews.map((rev, idx) => (
                        <div key={rev.id || idx} className="skiper-glass-card" style={{ padding: '12px 14px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                            <span>{rev.customerName} • {rev.serviceCategory}</span>
                            <span style={{ color: '#EA580C' }}>{'★'.repeat(rev.rating || 5)}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', color: '#44403C' }}>{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select className="glass-input" style={{ padding: '9px 12px', fontSize: '12.5px' }} value={reviewForm.serviceCategory} onChange={(e) => setReviewForm({ ...reviewForm, serviceCategory: e.target.value })} required>
                        <option value="">Select Service</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="AC & Appliance">AC & Appliance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Painting">Painting</option>
                      </select>
                      <select className="glass-input" style={{ padding: '9px 12px', fontSize: '12.5px' }} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                        <option value="5">★★★★★ (5.0)</option>
                        <option value="4">★★★★☆ (4.0)</option>
                        <option value="3">★★★☆☆ (3.0)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="glass-input" style={{ padding: '9px 14px', fontSize: '12.5px' }} placeholder="Write your review..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
                      <button type="submit" style={{ padding: '9px 18px', borderRadius: '12px', border: 'none', background: '#1C1917', color: '#FFFFFF', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}>
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 6: SERVICE PROVIDER PORTAL (GLASSMORPHISM) */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '26px' }}>
                <div style={{ padding: '22px', borderRadius: '20px', background: 'rgba(28, 25, 23, 0.88)', backdropFilter: 'blur(16px)', color: '#FFFFFF' }}>
                  <span style={{ fontSize: '11px', color: '#FDBA74', fontWeight: '800' }}>PROVIDER WALLET BALANCE</span>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#FB923C' }}>₹{(profile?.walletBalance ?? 0).toFixed(0)}</h2>
                </div>
                <div className="skiper-glass-section" style={{ padding: '22px', borderTop: '4px solid #F59E0B' }}>
                  <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>PENDING REQUESTS</span>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#D97706' }}>{pendingCount}</h2>
                </div>
                <div className="skiper-glass-section" style={{ padding: '22px', borderTop: '4px solid #EA580C' }}>
                  <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>ACTIVE ACCEPTED JOBS</span>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#EA580C' }}>{activeCount}</h2>
                </div>
                <div className="skiper-glass-section" style={{ padding: '22px', borderTop: '4px solid #16A34A' }}>
                  <span style={{ fontSize: '11px', color: '#57534E', fontWeight: '800' }}>COMPLETED WORKS</span>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#15803D' }}>{completedCount}</h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.95fr', gap: '26px' }}>
                <div className="skiper-glass-section" style={{ padding: '26px' }}>
                  <h3 style={{ marginTop: 0, fontSize: '19px', fontWeight: '800' }}>
                    Customer Dispatch Queue for {profile?.fullName || userPhone} ({bookings.length})
                  </h3>
                  {bookings.length === 0 ? (
                    <p style={{ fontSize: '13.5px', color: '#57534E' }}>No bookings assigned to {userPhone} in database yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {bookings.map((job) => (
                        <div key={job.id} className="skiper-glass-card" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                                <button onClick={() => handleProviderAction(job.id, 'ACCEPT')} style={{ padding: '9px 14px', borderRadius: '10px', border: 'none', background: '#1C1917', color: '#FFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                                  <Check size={14} /> Accept (+₹{job.price})
                                </button>
                                <button onClick={() => handleProviderAction(job.id, 'DECLINE')} style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                                  <XCircle size={14} /> Decline
                                </button>
                              </>
                            )}
                            {job.status === 'ACCEPTED' && (
                              <button onClick={() => handleProviderAction(job.id, 'COMPLETE')} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', background: '#16A34A', color: '#FFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                                Mark Work Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="skiper-glass-section" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} color="#EA580C" /> Work & Earnings Breakdown
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'end', height: '140px', padding: '12px', background: 'rgba(255,255,255,0.65)', borderRadius: '16px' }}>
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

          <FixoraFooter onSelectCategory={handleOpenServicePage} />
        </div>
      </div>

      {/* Floating Glassmorphic Bottom Dock (Fixora | Beauty | Homes | Bookings | Rewards) */}
      {userRole === 'CUSTOMER' && (
        <div
          className="skiper-glass-dock"
          style={{
            position: 'fixed',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 70,
            borderRadius: '22px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '26px'
          }}
        >
          {[
            {
              id: 'UC',
              label: 'Fixora',
              icon: Home,
              onClick: () => {
                setActiveDockTab('UC');
                setSection('HOME');
                setActiveServiceCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            },
            {
              id: 'BEAUTY',
              label: 'Beauty',
              icon: Sparkles,
              onClick: () => {
                setActiveDockTab('BEAUTY');
                setSection('HOME');
                setActiveServiceCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            },
            {
              id: 'HOMES',
              label: 'Homes',
              icon: Wrench,
              onClick: () => {
                setActiveDockTab('HOMES');
                setSection('HOME');
                setActiveServiceCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            },
            {
              id: 'BOOKINGS',
              label: 'Bookings',
              icon: CalendarCheck,
              onClick: () => {
                setActiveDockTab('BOOKINGS');
                setSection('BOOKINGS');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            },
            {
              id: 'REWARDS',
              label: 'Rewards',
              icon: Gift,
              onClick: () => {
                setActiveDockTab('REWARDS');
                setSection('REWARDS');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeDockTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  color: active ? '#1C1917' : '#78716C',
                  fontWeight: active ? '800' : '600',
                  fontSize: '11.5px',
                  borderBottom: active ? '2.5px solid #EA580C' : '2.5px solid transparent'
                }}
              >
                <Icon size={18} color={active ? '#EA580C' : '#78716C'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}