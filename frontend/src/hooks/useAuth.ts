import { useCallback, useState } from 'react';
import { apiClient } from '../api/client';

function getStoredUsername() {
  return localStorage.getItem('username') || '';
}

function getStoredRole() {
  return localStorage.getItem('role') || 'User';
}

export function useAuth() {
  const [username, setUsername] = useState(getStoredUsername);
  const [role, setRole] = useState(getStoredRole);

  const isLogedIn = Boolean(username && role);

  const refresh = useCallback(() => {
    setUsername(getStoredUsername());
    setRole(getStoredRole());
  }, []);

  const logout = useCallback(async() => {
    try
    {
      await apiClient.post('/api/Auth/logout');
    } catch {
    
    }
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUsername('');
    setRole('User');
  }, []);

  return { username, role, isLogedIn, refresh, logout };
}