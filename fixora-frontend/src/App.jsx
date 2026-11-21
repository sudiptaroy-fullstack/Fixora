import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Always start on the Login page when opening localhost:5173
  const [userSession, setUserSession] = useState(() => {
    try {
      localStorage.removeItem('fixora_session');
      sessionStorage.removeItem('fixora_session');
    } catch {
      // ignore storage errors
    }
    return null;
  });

  // Tracks active sub-view so browser Back/Forward buttons navigate inside Fixora
  const [currentView, setCurrentView] = useState('LOGIN');

  // Initialize a base history entry on mount so Back never exits the app abruptly
  useEffect(() => {
    window.history.replaceState({ view: 'LOGIN', session: null }, '', '#login');
  }, []);

  // Listen to browser Back / Forward button (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;

      if (!state || state.view === 'LOGIN' || !state.session) {
        // Stepping back to Login logs out cleanly instead of exiting localhost:5173
        setUserSession(null);
        setCurrentView('LOGIN');
        window.history.replaceState({ view: 'LOGIN', session: null }, '', '#login');
        return;
      }

      setUserSession(state.session);
      setCurrentView(state.view || 'HOME');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = useCallback((sessionData) => {
    const initialView = sessionData.role === 'ADMIN' ? 'ADMIN' : 'HOME';
    setUserSession(sessionData);
    setCurrentView(initialView);
    window.history.pushState(
      { view: initialView, session: sessionData },
      '',
      `#${initialView.toLowerCase()}`
    );
  }, []);

  const handleNavigateView = useCallback(
    (nextView) => {
      setCurrentView(nextView);
      if (userSession) {
        window.history.pushState(
          { view: nextView, session: userSession },
          '',
          `#${nextView.toLowerCase()}`
        );
      }
    },
    [userSession]
  );

  const handleLogout = useCallback(() => {
    setUserSession(null);
    setCurrentView('LOGIN');
    try {
      localStorage.removeItem('fixora_session');
      sessionStorage.removeItem('fixora_session');
    } catch {
      // ignore
    }
    window.history.pushState({ view: 'LOGIN', session: null }, '', '#login');
  }, []);

  if (!userSession || currentView === 'LOGIN') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (userSession.role === 'ADMIN') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <Dashboard
      userSession={userSession}
      onLogout={handleLogout}
      externalSection={currentView}
      onNavigateSection={handleNavigateView}
    />
  );
}