import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/accounts/profile/');
      setUser(data);
      // Droit admin : appel isole, un echec ici ne deconnecte pas l'utilisateur.
      try {
        const { data: me } = await api.get('/accounts/me/');
        setIsStaff(me?.is_staff === true);
      } catch {
        setIsStaff(false);
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsStaff(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/accounts/login/', { username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsStaff(false);
  };

  return { user, loading, login, logout, isAuthenticated: !!user, isStaff };
}
