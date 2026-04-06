import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Helper to safely parse local storage before the app even renders
const getCachedUser = () => {
  try {
    const cached = localStorage.getItem('user');
    // Prevent parsing the literal string "undefined" which crashes the auth state
    if (cached && cached !== 'undefined' && cached !== 'null') {
      return JSON.parse(cached);
    }
    return null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCachedUser);
  const [userData, setUserData] = useState(getCachedUser);
  
  // Always start loading as true to prevent flashing protected pages before we check
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      // If there is no token at all, clear everything to be safe
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

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
          localStorage.setItem('user', JSON.stringify(data));
        } else if (response.status === 401) {
          // 401 means the token expired, or the JWT_SECRET changed. 
          // We MUST log the user out so they can get a fresh, valid token.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        // Network completely disconnected. Rely on cache.
        console.warn("Network error during auth check, relying on cached user.");
      } finally {
        // Always stop loading whether it succeeds, fails, or catches an error
        setLoading(false); 
      }
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