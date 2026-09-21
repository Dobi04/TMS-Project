import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

function getStoredUsername() {
  return localStorage.getItem('username') || '';
}

function getStoredRole() {
  return localStorage.getItem('role') || 'Guest';
}

export function useAuth() {
  const [username, setUsername] = useState(getStoredUsername);
  const [role, setRole] = useState(getStoredRole);

  const isLogedIn = Boolean(username && role);

  const refresh = useCallback(() => {
    setUsername(getStoredUsername());
    setRole(getStoredRole());
  }, []);

  useEffect(() => {
    window.addEventListener('auth:changed', refresh);
    window.addEventListener('storage', refresh);
    return() => {
      window.removeEventListener('auth:changed', refresh);
      window.removeEventListener('storage', refresh);
    }
  }, [refresh]);

  const logout = useCallback(async() => {
    try
    {
      await apiClient.post('/api/Auth/logout');
    } catch {
    
    }
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUsername('');
    setRole('Guest');
    window.dispatchEvent(new Event('auth:changed'))
  }, []);

  return { username, role, isLogedIn, refresh, logout };
}