import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { registerUser, sendOtp, verifyOtp } from '../services/api';
import FixoraLogo from './FixoraLogo';
import { MotionVideoBackdrop, OrangeCrystalsStage, DropletReveal } from './MotionPrimitives';
import { User, Wrench, ArrowRight, Lock, CheckCircle2, BellRing } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('SIGNIN'); // SIGNIN | REGISTER
  const [selectedRole, setSelectedRole] = useState('CUSTOMER'); // CUSTOMER | PROVIDER | ADMIN
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Howrah, WB');
  const [category, setCategory] = useState('Plumber');
  const [otp, setOtp] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Fires an actual OS / Mobile Device Notification Banner (Android / Windows / macOS tray)
  const triggerDevicePushNotification = async (phone, code) => {
    if (!('Notification' in window)) return;
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission === 'granted') {
      new Notification('Fixora Verification OTP', {
        body: `Your Fixora login OTP for +91 ${phone} is ${code}. Do not share this code.`,
        tag: 'fixora-otp'
      });
    }
  };

  // 1. Register New User in MySQL -> Show Notification -> Return to Sign In Tab
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || phoneNumber.length < 10) {
      setIsError(true);
      setMessage('Please enter your Full Name and a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await registerUser({
        phone: phoneNumber,
        role: selectedRole,
        fullName: fullName.trim(),
        email: email.trim(),
        address: address.trim() || '12/A Panchanantala Road, Howrah',
        city: city.trim() || 'Howrah, WB',
        category: selectedRole === 'PROVIDER' ? category : null
      });

      if ('Notification' in window && Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('Fixora Account Created', {
            body: `Welcome ${fullName.trim()}! You're signed up. Now log in with +91 ${phoneNumber}.`
          });
        }
      }

      setAuthMode('SIGNIN');
      setStep(1);
      setOtp('');
      setIsError(false);
      setMessage("You're signed up! Now log in with your registered mobile number.");
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.error || 'Registration failed. Check if the number is already registered.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP -> Dispatches Native Device Notification
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setIsError(true);
      setMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await sendOtp(phoneNumber, selectedRole);
      const receivedOtp = response.data?.liveSmsOtp;
      if (receivedOtp) {
        await triggerDevicePushNotification(phoneNumber, receivedOtp);
      }
      setStep(2);
      setIsError(false);
      setMessage(`OTP sent to your device notification bar for +91 ${phoneNumber}.`);
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.error || 'Number not registered. Switch to Register / Sign Up first.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setIsError(true);
      setMessage('Please enter the 6-digit OTP from your device notification.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await verifyOtp(phoneNumber, otp);
      if (response.data && response.data.verified === true) {
        onLoginSuccess({ phone: phoneNumber, role: selectedRole });
      } else {
        setIsError(true);
        setMessage('Invalid OTP code. Check your phone/desktop notification bar.');
      }
    } catch {
      setIsError(true);
      setMessage('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === 'admin123' || adminPin === '2026') {
      onLoginSuccess({ phone: 'ADMIN-HQ', role: 'ADMIN' });
    } else {
      setIsError(true);
      setMessage('Invalid Admin Security Key. (Default: admin123)');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', position: 'relative' }}>
      <MotionVideoBackdrop variant="login" />

      <div style={{ width: '100%', maxWidth: '1060px', display: 'grid', gridTemplateColumns: '1.14fr 0.86fr', gap: '24px', position: 'relative', zIndex: 2, alignItems: 'stretch' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 210, damping: 20, delay: 0.45 }}
          className="glass-window"
          style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ marginBottom: '18px' }}>
              <FixoraLogo size={42} />
            </div>

            <DropletReveal delay={0.55}>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '31px', fontWeight: '800', color: '#1C1917', letterSpacing: '-0.8px' }}>
                {selectedRole === 'ADMIN' ? 'Admin Command' : authMode === 'REGISTER' ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p style={{ margin: '0 0 18px 0', fontSize: '13.5px', color: '#57534E' }}>
                {selectedRole === 'ADMIN'
                  ? 'Authorized telemetry & escrow oversight for Fixora.'
                  : authMode === 'REGISTER'
                  ? 'Sign up as a Customer or Service Provider to save your profile to MySQL.'
                  : 'Sign in with your registered mobile number. OTP arrives in your device notifications.'}
              </p>
            </DropletReveal>

            {selectedRole !== 'ADMIN' && (
              <>
                <div style={{ display: 'flex', gap: '22px', borderBottom: '1px solid rgba(28,25,23,0.12)', marginBottom: '18px' }}>
                  {['SIGNIN', 'REGISTER'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setAuthMode(m); setStep(1); setMessage(''); setIsError(false); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px 4px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        color: authMode === m ? '#EA580C' : '#78716C',
                        borderBottom: authMode === m ? '2.5px solid #EA580C' : '2.5px solid transparent'
                      }}
                    >
                      {m === 'SIGNIN' ? 'Sign In' : 'Register / Sign Up'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', background: 'rgba(28, 25, 23, 0.06)', padding: '5px', borderRadius: '999px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('CUSTOMER'); setStep(1); setMessage(''); }}
                    className="role-tab"
                    style={{
                      background: selectedRole === 'CUSTOMER' ? '#1C1917' : 'transparent',
                      color: selectedRole === 'CUSTOMER' ? '#FFFFFF' : '#44403C'
                    }}
                  >
                    <User size={15} /> Customer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('PROVIDER'); setStep(1); setMessage(''); }}
                    className="role-tab"
                    style={{
                      background: selectedRole === 'PROVIDER' ? '#1C1917' : 'transparent',
                      color: selectedRole === 'PROVIDER' ? '#FFFFFF' : '#44403C'
                    }}
                  >
                    <Wrench size={15} /> Service Provider
                  </button>
                </div>
              </>
            )}

            {selectedRole === 'ADMIN' ? (
              <form onSubmit={handleAdminLogin}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  Admin Master Security Key
                </label>
                <input
                  type="password"
                  className="glass-input"
                  placeholder="Enter Admin Key (default: admin123)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  style={{ marginBottom: '18px' }}
                />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="dialer-btn" style={{ width: '100%' }}>
                  <span className="dialer-btn-inner" style={{ padding: '13px 22px' }}>Unlock Admin Command Center</span>
                </motion.button>
              </form>
            ) : authMode === 'REGISTER' ? (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: selectedRole === 'PROVIDER' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Full Name (e.g., Sudipta Roy)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {selectedRole === 'PROVIDER' && (
                    <select className="glass-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="AC & Appliance">AC & Appliance</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="tel"
                    className="glass-input"
                    placeholder="10-digit Mobile Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Doorstep Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="dialer-btn" style={{ width: '100%', marginTop: '4px' }}>
                  <span className="dialer-btn-inner" style={{ padding: '13px 22px' }}>
                    {loading ? 'Saving Account...' : `Complete ${selectedRole === 'CUSTOMER' ? 'Customer' : 'Provider'} Sign Up`}
                    <ArrowRight size={16} />
                  </span>
                </motion.button>
              </form>
            ) : step === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="tel"
                  className="glass-input"
                  placeholder="Enter registered 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />

                <div style={{ fontSize: '12px', color: '#57534E', display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '6px' }}>
                  <BellRing size={14} color="#EA580C" />
                  Allow browser/phone notifications when prompted to receive your OTP in the notification bar.
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="dialer-btn" style={{ width: '100%', marginTop: '4px' }}>
                  <span className="dialer-btn-inner" style={{ padding: '13px 22px' }}>
                    {loading ? 'Sending Notification...' : `Send ${selectedRole === 'CUSTOMER' ? 'Customer' : 'Provider'} OTP`}
                    <ArrowRight size={16} />
                  </span>
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  Enter 6-Digit OTP from Device Notification (+91 {phoneNumber})
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ marginBottom: '16px', letterSpacing: '3px', fontWeight: '800', textAlign: 'center', fontSize: '17px' }}
                />

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="dialer-btn" style={{ width: '100%', marginBottom: '10px' }}>
                  <span className="dialer-btn-inner" style={{ padding: '13px 22px' }}>
                    {loading ? 'Verifying...' : `Proceed to ${selectedRole === 'CUSTOMER' ? 'Customer' : 'Provider'} Portal`}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setMessage(''); }}
                  style={{ width: '100%', background: 'none', border: 'none', color: '#57534E', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ← Change phone number
                </button>
              </form>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '14px',
                  padding: '11px 15px',
                  borderRadius: '14px',
                  background: isError ? 'rgba(254, 226, 226, 0.9)' : 'rgba(255, 247, 237, 0.92)',
                  border: `1px solid ${isError ? '#FCA5A5' : '#FDBA74'}`,
                  color: isError ? '#991B1B' : '#9A3412',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={16} color={isError ? '#DC2626' : '#EA580C'} />
                {message}
              </motion.div>
            )}
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(28,25,23,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#57534E', fontWeight: '600' }}>
            <span>Fixora Verified Security</span>
            {selectedRole !== 'ADMIN' ? (
              <button
                type="button"
                onClick={() => { setSelectedRole('ADMIN'); setMessage(''); setIsError(false); }}
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(28,25,23,0.14)', borderRadius: '999px', padding: '6px 12px', color: '#1C1917', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
              >
                <Lock size={13} /> Admin Portal Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setSelectedRole('CUSTOMER'); setMessage(''); setIsError(false); }}
                style={{ background: 'none', border: 'none', color: '#EA580C', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
              >
                ← Back to Customer / Provider Login
              </button>
            )}
          </div>
        </motion.div>

        <OrangeCrystalsStage />
      </div>
    </div>
  );
}