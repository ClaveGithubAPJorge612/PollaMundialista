/* ─────────────────────────────────────────────────────────────────────────────
   src/hooks/useAuth.jsx
   Authentication state hook.
   Wraps auth.js service and exposes a clean interface to components.
───────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getCurrentUser, signIn, signUp, confirmSignUp, signOut, changePassword } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const u = await signIn(email, password);
      setUser(u);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signUp(username, email, password);
      return { success: true, ...result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const confirm = useCallback(async (email, code) => {
    setError(null);
    try {
      await confirmSignUp(email, code);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const updatePassword = useCallback(async (oldPwd, newPwd) => {
    setError(null);
    try {
      await changePassword(user.email, oldPwd, newPwd);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, confirm, logout, updatePassword, clearError, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
