import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('cb_user')) || null; } catch { return null; }
  });
  const [adminKey, setAdminKey] = useState(() => {
    return localStorage.getItem('cb_admin_key') || null;
  });

  const admin = !!adminKey;

  function loginUser(name, email, phone) {
    const u = { name, email, phone };
    setUser(u);
    localStorage.setItem('cb_user', JSON.stringify(u));
  }

  function logoutUser() {
    setUser(null);
    localStorage.removeItem('cb_user');
  }

  function loginAdmin(key) {
    setAdminKey(key);
    localStorage.setItem('cb_admin_key', key);
  }

  function logoutAdmin() {
    setAdminKey(null);
    localStorage.removeItem('cb_admin_key');
  }

  return (
    <AuthContext.Provider value={{ user, admin, adminKey, loginUser, logoutUser, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
