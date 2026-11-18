import React, { useState } from 'react';
import { sendOtp, verifyOtp } from '../services/api';
import { ShieldCheck, Phone, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanedPhone = phoneNumber.trim();
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setIsError(true);
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setIsError(false);
    setMessage('');

    try {
      await sendOtp(cleanedPhone);
      setStep(2);
      setIsError(false);
      setMessage('OTP sent! Check your IntelliJ Spring Boot console for the 6-digit code.');
    } catch (err) {
      setIsError(true);
      setMessage('Could not connect to backend. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanedOtp = otp.trim();
    if (!cleanedOtp || cleanedOtp.length < 4) {
      setIsError(true);
      setMessage('Please enter the OTP from your console.');
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const response = await verifyOtp(phoneNumber.trim(), cleanedOtp);
      // Backend returns "OTP verified successfully!" or "Invalid or expired OTP!"
      if (typeof response.data === 'string' && response.data.toLowerCase().includes('invalid')) {
        setIsError(true);
        setMessage(response.data);
      } else {
        setIsError(false);
        setMessage('Login Successful!');
        onLoginSuccess(phoneNumber.trim());
      }
    } catch (err) {
      setIsError(true);
      setMessage('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="neu-card" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px' }}>Fixora</h1>
        <p style={{ color: '#666666', fontSize: '14px', margin: '0 0 28px 0' }}>Find • Book • Relax</p>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: '#E9E9E9',
            color: isError ? '#b91c1c' : '#171717',
            boxShadow: 'inset 2px 2px 5px #d5d5d5, inset -2px -2px 5px #ffffff'
          }}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Phone size={18} color="#666666" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                className="neu-input"
                placeholder="Enter 10-digit Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
              />
            </div>
            <button type="submit" className="neu-button" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get OTP'} <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <ShieldCheck size={18} color="#666666" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                className="neu-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
              />
            </div>
            <button type="submit" className="neu-button" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#666666', marginTop: '16px', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}