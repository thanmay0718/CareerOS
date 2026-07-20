import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';
import { clearAuthSession, readAuthSession, writeAuthSession } from '../api/storage';
import { decodeJwt, isJwtExpired } from '../utils/jwt';

const AuthContext = createContext(null);

function buildSession(user, accessToken, expiresInMs) {
  const payload = decodeJwt(accessToken);
  const roles = Array.isArray(payload?.roles) ? payload.roles : [];

  return {
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles,
    },
    token: accessToken,
    expiresAt: Date.now() + expiresInMs,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const storedSession = readAuthSession();

    if (storedSession?.token && !isJwtExpired(storedSession.token)) {
      setSession(storedSession);
    } else {
      clearAuthSession();
      setSession(null);
    }

    setIsRestoring(false);

    const handleAuthExpiry = () => {
      clearAuthSession();
      setSession(null);
    };

    window.addEventListener('careeros:auth-expired', handleAuthExpiry);
    return () => window.removeEventListener('careeros:auth-expired', handleAuthExpiry);
  }, []);

  useEffect(() => {
    if (session) {
      writeAuthSession(session);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.expiresAt) {
      return undefined;
    }

    const timeout = Math.max(session.expiresAt - Date.now(), 0);
    const timer = window.setTimeout(() => {
      clearAuthSession();
      setSession(null);
    }, timeout);

    return () => window.clearTimeout(timer);
  }, [session]);

  async function login(payload) {
    const response = await loginUser(payload);
    if (response.dailyLoginCoinAwarded) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('careeros-login-reward', JSON.stringify({
        coins: response.dailyLoginCoinsAwarded ?? 1,
        userId: response.userId,
        email: response.email,
        awardedDate: today,
        awardedAt: Date.now(),
      }));
    }
    const nextSession = buildSession(response, response.accessToken, response.expiresInMs);
    setSession(nextSession);
    return response;
  }

  async function register(payload) {
    const response = await registerUser(payload);
    const nextSession = buildSession(response, response.accessToken, response.expiresInMs);
    setSession(nextSession);
    return response;
  }

  function logout() {
    clearAuthSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: Boolean(session?.token && !isJwtExpired(session.token)),
        isRestoring,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
