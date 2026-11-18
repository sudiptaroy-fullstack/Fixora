import React, { useState } from 'react';
import Login from './components/Login';

export default function App() {
  const [loggedInPhone, setLoggedInPhone] = useState(null);

  return (
    <div>
      {!loggedInPhone ? (
        <Login onLoginSuccess={(phone) => setLoggedInPhone(phone)} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="neu-card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Welcome to Fixora!</h2>
            <p style={{ color: '#555' }}>Logged in with phone: <strong>{loggedInPhone}</strong></p>
            <button
              className="neu-button"
              onClick={() => setLoggedInPhone(null)}
              style={{ padding: '10px 20px', borderRadius: '10px', marginTop: '15px' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}