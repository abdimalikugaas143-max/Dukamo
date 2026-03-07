import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getToken, setToken, clearToken } from '@/lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'supervisor';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('ops_user') || 'null'); } catch { return null; }
  });
  const [token, setTokenState] = useState<string | null>(getToken);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) { setUser(u); localStorage.setItem('ops_user', JSON.stringify(u)); } else { clearToken(); setTokenState(null); } })
        .finally(() => setLoading(false));
    }
  }, [token, user]);

  function login(newToken: string, newUser: AuthUser) {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem('ops_user', JSON.stringify(newUser));
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
