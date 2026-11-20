import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [loggedInPhone, setLoggedInPhone] = useState(null);

  return (
    <div>
      {!loggedInPhone ? (
        <Login onLoginSuccess={(phone) => setLoggedInPhone(phone)} />
      ) : (
        <Dashboard
          userPhone={loggedInPhone}
          onLogout={() => setLoggedInPhone(null)}
        />
      )}
    </div>
  );
}