import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Helper to safely parse local storage before the app even renders
const getCachedUser = () => {
  try {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // 1. Initialize state directly from the cache
  const [user, setUser] = useState(getCachedUser);
  const [userData, setUserData] = useState(getCachedUser);
  
  // 2. If we already have a cached user, we don't need to show a loading screen
  const [loading, setLoading] = useState(!getCachedUser());

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setUserData(data);
            // Refresh the cache when online
            localStorage.setItem('user', JSON.stringify(data));
          } else if (response.status === 401) {
            // 3. ONLY log out if the server explicitly says the token is expired/invalid.
            // This prevents logging out during 503/504 offline errors.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setUserData(null);
          }
        } catch (err) {
          // 4. Network completely disconnected. 
          // We do nothing here, allowing the cached user to keep them logged in.
          console.warn("Network error during auth check, relying on cached user.");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setUserData(data.user);
    return data.user;
  };

  const signup = async (userDataPayload) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDataPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setUserData(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserData(null);
  };

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    logout,
    isAdmin: userData?.role === 'admin',
    isTourismOffice: userData?.role === 'tourism_office',
    isTourist: userData?.role === 'tourist'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);