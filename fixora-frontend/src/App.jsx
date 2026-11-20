import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [userSession, setUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('fixora_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    localStorage.setItem('fixora_session', JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('fixora_session');
  };

  if (!userSession) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (userSession.role === 'ADMIN') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return <Dashboard userSession={userSession} onLogout={handleLogout} />;
}