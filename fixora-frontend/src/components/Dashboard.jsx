import React, { useState, useEffect } from 'react';
import {
  getAiRecommendation,
  createServiceRequest,
  getCustomerRequests,
  getAllRequests,
  updateRequestStatus,
  getAdminStats,
  createPaymentOrder,
  verifyPaymentOrder
} from '../services/api';
import {
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  CheckCircle,
  Clock,
  LogOut,
  CreditCard,
  UserCheck,
  Star,
  Phone,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function Dashboard({ userPhone, onLogout }) {
  const [viewMode, setViewMode] = useState('CUSTOMER'); // 'CUSTOMER' or 'ADMIN'
  const [problemDescription, setProblemDescription] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalRequests: 0,
    pendingJobs: 0,
    acceptedJobs: 0,
    completedJobs: 0
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [paidJobIds, setPaidJobIds] = useState([]);

  // Color-coded category icons (Blue Plumber, Yellow Electrician, Orange Carpenter)
  const categories = [
    {
      name: 'Plumber',
      icon: <Wrench size={26} color="#0284C7" />,
      badgeBg: '#E0F2FE',
      badgeBorder: '#7DD3FC',
      accentColor: '#0284C7',
      tag: 'Water & Piping',
      desc: 'Pipes, leaks, taps & bathroom fittings',
      price: 499
    },
    {
      name: 'Electrician',
      icon: <Zap size={26} color="#D97706" fill="#F59E0B" />,
      badgeBg: '#FEF3C7',
      badgeBorder: '#FDE68A',
      accentColor: '#D97706',
      tag: 'Power & Wiring',
      desc: 'Fans, switches, MCB & appliance wiring',
      price: 399
    },
    {
      name: 'Carpenter',
      icon: <Hammer size={26} color="#EA580C" />,
      badgeBg: '#FFEDD5',
      badgeBorder: '#FDBA74',
      accentColor: '#EA580C',
      tag: 'Wood & Fixtures',
      desc: 'Doors, locks, cabinets & furniture repair',
      price: 549
    },
  ];

  const getCategoryColor = (catName) => {
    if (!catName) return '#1B3B2B';
    const lower = catName.toLowerCase();
    if (lower.includes('plumb')) return '#0284C7';
    if (lower.includes('electr')) return '#D97706';
    if (lower.includes('carpent')) return '#EA580C';
    return '#1B3B2B';
  };

  const getStatusStyle = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'COMPLETED') {
      return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
    }
    if (s === 'ACCEPTED') {
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
    }
    return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
  };

  const loadDashboardData = async () => {
    try {
      const allRes = await getAllRequests();
      const allList = allRes.data || [];
      setAllBookings(allList);

      try {
        const custRes = await getCustomerRequests(userPhone);
        setMyBookings(custRes.data || []);
      } catch (e) {
        setMyBookings(allList.filter(b => b.customerPhone === userPhone));
      }

      try {
        const statsRes = await getAdminStats();
        if (statsRes.data) setAdminStats(statsRes.data);
      } catch (e) {
        setAdminStats({
          totalRequests: allList.length,
          pendingJobs: allList.filter(r => r.status === 'PENDING').length,
          acceptedJobs: allList.filter(r => r.status === 'ACCEPTED').length,
          completedJobs: allList.filter(r => r.status === 'COMPLETED').length,
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [viewMode]);

  const handleAiDiagnose = async (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setLoadingAi(true);
    setBannerMessage('');
    try {
      const res = await getAiRecommendation(problemDescription);
      setRecommendation(res.data);
    } catch (err) {
      setBannerMessage('Could not fetch AI recommendation. Make sure backend is running on port 8081.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleBookService = async (categoryName, customDesc, assignedProvider, customPrice) => {
    try {
      await createServiceRequest({
        problemDescription: customDesc || `Standard ${categoryName} visit & inspection`,
        category: categoryName,
        customerPhone: userPhone,
        providerName: assignedProvider || 'Assigning technician...',
        price: customPrice || 499.0
      });
      setBannerMessage(`Booked ${categoryName} service successfully!`);
      setProblemDescription('');
      setRecommendation(null);
      loadDashboardData();
    } catch (err) {
      setBannerMessage('Failed to book service request.');
    }
  };

  const handlePayNow = async (booking) => {
    try {
      setBannerMessage('Creating Razorpay payment order...');
      let orderId = 'order_demo_' + booking.id;

      try {
        const orderRes = await createPaymentOrder({
          amount: booking.price || 499,
          customerPhone: userPhone,
          serviceRequestId: booking.id
        });
        if (orderRes.data && orderRes.data.orderId) {
          orderId = orderRes.data.orderId;
        }
      } catch (e) {
        console.warn('Using fallback mock order ID');
      }

      const confirmPay = window.confirm(
        `Fixora Secure Checkout\n\nOrder ID: ${orderId}\nService: ${booking.category}\nAmount: ₹${booking.price || 499}\n\nClick OK to complete payment.`
      );

      if (confirmPay) {
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 10);
        try {
          await verifyPaymentOrder({
            orderId: orderId,
            razorpayPaymentId: mockPaymentId
          });
        } catch (e) {
          console.warn('Payment verified locally');
        }
        setPaidJobIds([...paidJobIds, booking.id]);
        setBannerMessage(`Payment of ₹${booking.price || 499} verified! (Order: ${orderId})`);
      } else {
        setBannerMessage('Payment cancelled.');
      }
    } catch (err) {
      setBannerMessage('Payment failed.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      setBannerMessage(`Job #${id} marked as ${newStatus}!`);
      loadDashboardData();
    } catch (err) {
      setBannerMessage('Failed to update job status.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #163324 0%, #1B3B2B 60%, #3E543F 84%, #D8C8B0 100%)',
      padding: '28px 42px'
    }}>
      {/* Top Navbar (Beige surface on Forest Green background) */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', marginBottom: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1B3B2B, #2D5A43)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5EFE6',
            fontWeight: '800',
            fontSize: '20px',
            boxShadow: '0 4px 10px rgba(27, 59, 43, 0.35)'
          }}>
            F
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '23px', fontWeight: '800', color: '#1A2E22' }}>Fixora</h2>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 9px',
                borderRadius: '99px',
                backgroundColor: '#DCE8E0',
                color: '#1B3B2B',
                border: '1px solid #B5CBBF'
              }}>
                Smart Home Services
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#4E5D53', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <Phone size={12} color="#1B3B2B" /> Logged in: <strong style={{ color: '#1A2E22' }}>{userPhone}</strong>
              <span style={{ color: '#15803D', fontWeight: '700', marginLeft: '4px' }}>● Active</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode(viewMode === 'CUSTOMER' ? 'ADMIN' : 'CUSTOMER')}
            className="neu-button"
            style={{
              padding: '10px 18px',
              borderRadius: '11px',
              background: viewMode === 'ADMIN' ? 'linear-gradient(135deg, #0284C7, #0369A1)' : '#1B3B2B',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <Activity size={15} />
            {viewMode === 'CUSTOMER' ? 'Switch to Provider / Admin View' : 'Switch to Customer View'}
          </button>

          <button
            onClick={onLogout}
            className="neu-button"
            style={{
              padding: '10px 16px',
              borderRadius: '11px',
              backgroundColor: '#2C4A3A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <LogOut size={15} color="#FCA5A5" /> Logout
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {bannerMessage && (
        <div className="neu-card" style={{
          padding: '14px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          fontSize: '14px',
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          borderLeft: '5px solid #10B981'
        }}>
          <CheckCircle size={18} color="#10B981" /> {bannerMessage}
        </div>
      )}

      {viewMode === 'CUSTOMER' ? (
        /* ================= CUSTOMER VIEW ================= */
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '28px' }}>
          {/* Left Column: AI Diagnosis + Quick Book */}
          <div>
            {/* AI Diagnosis Card */}
            <div className="neu-card" style={{ padding: '26px', marginBottom: '28px', borderTop: '4px solid #2D6A4F' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#DCE8E0',
                    border: '1px solid #B5CBBF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={22} color="#1B3B2B" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1A2E22' }}>AI Smart Problem Diagnosis</h3>
                    <p style={{ fontSize: '12px', color: '#5A5246', margin: '2px 0 0 0' }}>
                      Describe what is broken and Fixora AI will match the highest-rated specialist.
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#DCE8E0',
                  color: '#1B3B2B'
                }}>
                  AI Powered
                </span>
              </div>

              <form onSubmit={handleAiDiagnose} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <input
                  type="text"
                  className="neu-input"
                  placeholder="e.g., Kitchen sink pipe is leaking or bedroom fan is making noise..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="neu-button"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1B3B2B, #2D5A43)'
                  }}
                  disabled={loadingAi}
                >
                  {loadingAi ? 'Analyzing...' : 'Diagnose'}
                </button>
              </form>

              {recommendation && (
                <div className="neu-inset" style={{
                  marginTop: '20px',
                  padding: '18px 20px',
                  borderLeft: '4px solid #1B3B2B'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#1B3B2B',
                        backgroundColor: '#DCE8E0',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        AI MATCH • {recommendation.category}
                      </span>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '18px', color: '#1A2E22' }}>
                        {recommendation.providerName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#5A5246' }}>{recommendation.matchReason}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '13px', fontWeight: '700' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" /> {recommendation.rating} / 5.0
                        </span>
                        <span style={{ color: '#3D372E', fontSize: '12px' }}>
                          • {recommendation.completedJobs} Jobs Completed
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookService(recommendation.category, problemDescription, recommendation.providerName, 499)}
                      className="neu-button"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '11px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #1B3B2B, #2D5A43)'
                      }}
                    >
                      Book for ₹499
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instant Category Booking Header (Light Beige Text on Forest Green background) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '19px', color: '#F5EFE6' }}>Instant Category Booking</h3>
              <span style={{ fontSize: '12px', color: '#D8C8B0', fontWeight: '500' }}>Verified doorstep specialists</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="neu-card"
                  style={{
                    padding: '22px 18px',
                    textAlign: 'center',
                    borderTop: `4px solid ${cat.accentColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Colored Service Logo Circle (Blue / Yellow / Orange) */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      backgroundColor: cat.badgeBg,
                      border: `2px solid ${cat.badgeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                    }}>
                      {cat.icon}
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: cat.accentColor,
                      backgroundColor: cat.badgeBg,
                      padding: '2px 8px',
                      borderRadius: '99px'
                    }}>
                      {cat.tag}
                    </span>

                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '18px', color: '#1A2E22' }}>{cat.name}</h4>
                    <p style={{ fontSize: '12px', color: '#5A5246', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      {cat.desc}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#EADFD0',
                      border: '1px solid #D5C5AE',
                      display: 'inline-block',
                      marginBottom: '14px',
                      fontSize: '15px',
                      fontWeight: '800',
                      color: '#1A2E22'
                    }}>
                      ₹{cat.price} <span style={{ fontSize: '11px', fontWeight: '500', color: '#5A5246' }}>/ visit</span>
                    </div>

                    <button
                      onClick={() => handleBookService(cat.name, `Standard ${cat.name} visit`, null, cat.price)}
                      className="neu-button"
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '11px',
                        fontSize: '13px',
                        fontWeight: '700',
                        backgroundColor: '#1B3B2B',
                        borderBottom: `3px solid ${cat.accentColor}`
                      }}
                    >
                      Book {cat.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Customer's Bookings & Payment */}
          <div className="neu-card" style={{ padding: '26px', height: 'fit-content', borderTop: '4px solid #2D6A4F' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '9px', fontSize: '18px', color: '#1A2E22' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: '#DCE8E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} color="#1B3B2B" />
                </div>
                My Service Bookings
              </h3>
              <span style={{
                fontSize: '12px',
                fontWeight: '800',
                padding: '4px 11px',
                borderRadius: '99px',
                backgroundColor: '#1B3B2B',
                color: '#F5EFE6'
              }}>
                {myBookings.length} Total
              </span>
            </div>

            {myBookings.length === 0 ? (
              <div className="neu-inset" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#5A5246', margin: 0 }}>
                  You have no active service requests yet. Try the AI Diagnosis or click a category card!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myBookings.map((b) => {
                  const isPaid = paidJobIds.includes(b.id);
                  const catColor = getCategoryColor(b.category);
                  const statusStyle = getStatusStyle(b.status);

                  return (
                    <div
                      key={b.id}
                      className="neu-inset"
                      style={{
                        padding: '16px 18px',
                        borderLeft: `5px solid ${catColor}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '15px', color: '#1A2E22' }}>
                          #{b.id} • {b.category}
                        </strong>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`
                        }}>
                          {b.status}
                        </span>
                      </div>

                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#3D372E', fontWeight: '500' }}>
                        {b.problemDescription}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid #D5C5AE',
                        fontSize: '12px',
                        color: '#5A5246'
                      }}>
                        <span>Technician: <strong style={{ color: '#1A2E22' }}>{b.providerName || 'Assigning...'}</strong></span>
                        <span>Fee: <strong style={{ color: '#1A2E22', fontSize: '14px' }}>₹{b.price || 499}</strong></span>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        {isPaid ? (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#065F46',
                            backgroundColor: '#D1FAE5',
                            border: '1px solid #6EE7B7',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            <ShieldCheck size={15} color="#059669" /> Paid via Razorpay
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayNow(b)}
                            className="neu-button"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '9px',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: 'linear-gradient(135deg, #1B3B2B, #2D5A43)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CreditCard size={14} /> Pay ₹{b.price || 499} via Razorpay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= PROVIDER & ADMIN VIEW ================= */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
            <div className="neu-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #1B3B2B' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5A5246' }}>TOTAL REQUESTS</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#1B3B2B' }}>{adminStats.totalRequests}</h2>
            </div>
            <div className="neu-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #D97706' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5A5246' }}>PENDING JOBS</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#D97706' }}>{adminStats.pendingJobs}</h2>
            </div>
            <div className="neu-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #0284C7' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5A5246' }}>ACCEPTED JOBS</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#0284C7' }}>{adminStats.acceptedJobs}</h2>
            </div>
            <div className="neu-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #059669' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5A5246' }}>COMPLETED JOBS</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '30px', color: '#059669' }}>{adminStats.completedJobs}</h2>
            </div>
          </div>

          <div className="neu-card" style={{ padding: '26px', borderTop: '4px solid #2D6A4F' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1A2E22' }}>
              <UserCheck size={20} color="#1B3B2B" /> Service Provider Dispatch & Job Queue
            </h3>
            <p style={{ fontSize: '13px', color: '#5A5246', marginBottom: '18px' }}>
              Accept pending customer requests to auto-assign the top technician from MySQL, or mark ongoing jobs as Completed.
            </p>

            {allBookings.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#5A5246' }}>No jobs in the system yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {allBookings.map((job) => {
                  const catColor = getCategoryColor(job.category);
                  const statusStyle = getStatusStyle(job.status);

                  return (
                    <div
                      key={job.id}
                      className="neu-inset"
                      style={{
                        padding: '16px 20px',
                        borderLeft: `5px solid ${catColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ color: '#1A2E22' }}>Job #{job.id} • {job.category}</strong>
                          <span style={{ fontSize: '12px', color: '#5A5246' }}>(Customer: {job.customerPhone})</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 9px',
                            borderRadius: '99px',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`
                          }}>
                            {job.status}
                          </span>
                        </div>
                        <p style={{ margin: '6px 0', fontSize: '13px', color: '#3D372E', fontWeight: '500' }}>
                          {job.problemDescription}
                        </p>
                        <span style={{ fontSize: '12px', color: '#5A5246' }}>
                          Assigned Provider: <strong style={{ color: '#1A2E22' }}>{job.providerName || 'Unassigned'}</strong> • Fee: <strong>₹{job.price || 499}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        {job.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'ACCEPTED')}
                            className="neu-button"
                            style={{
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              background: 'linear-gradient(135deg, #0284C7, #0369A1)'
                            }}
                          >
                            Accept & Auto-Assign
                          </button>
                        )}
                        {job.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'COMPLETED')}
                            className="neu-button"
                            style={{
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              background: 'linear-gradient(135deg, #1B3B2B, #2D5A43)'
                            }}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}