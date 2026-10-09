import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES } from '../constants';
import { userService, DEFAULT_USERS } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => userService.getActiveUser());
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = localStorage.getItem('novaboard_auth_session');
    // If no session explicitly set, start on login page to present it
    return session === 'true';
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);

      // Verify active user still exists or update state
      const active = userService.getActiveUser();
      const matched = data.find(u => u.id === active.id) || data[0];
      if (matched) {
        setCurrentUserState(matched);
        userService.setActiveUser(matched);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user);
    userService.setActiveUser(user);
  }, []);

  const login = useCallback(async (email, password = '') => {
    const targetEmail = (email || '').trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === targetEmail);

    if (!foundUser) {
      throw new Error(`No account found with email "${email}". Please choose from the available users.`);
    }

    setCurrentUserState(foundUser);
    userService.setActiveUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('novaboard_auth_session', 'true');
    return foundUser;
  }, [users]);

  const loginAsUser = useCallback((user) => {
    setCurrentUserState(user);
    userService.setActiveUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('novaboard_auth_session', 'true');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('novaboard_auth_session');
  }, []);

  const addUser = useCallback(async (userData) => {
    const saved = await userService.saveUser(userData);
    await loadUsers();
    return saved;
  }, [loadUsers]);

  const updateUser = useCallback(async (userData) => {
    const saved = await userService.saveUser(userData);
    await loadUsers();
    if (currentUser?.id === userData.id) {
      setCurrentUserState(prev => ({ ...prev, ...userData }));
      userService.setActiveUser({ ...currentUser, ...userData });
    }
    return saved;
  }, [loadUsers, currentUser]);

  const deleteUser = useCallback(async (userId) => {
    await userService.deleteUser(userId);
    await loadUsers();
    if (currentUser?.id === userId) {
      const remaining = users.filter(u => u.id !== userId);
      if (remaining.length > 0) {
        setCurrentUser(remaining[0]);
      }
    }
  }, [loadUsers, currentUser, users, setCurrentUser]);

  // Role permissions
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const isContributor = currentUser?.role === ROLES.CONTRIBUTOR;
  const isViewer = currentUser?.role === ROLES.VIEWER;

  // Granular capability flags
  const canManageUsers = isAdmin;
  const canManipulateTasks = isAdmin || isContributor;
  const canDeleteTasks = isAdmin;

  const value = {
    currentUser,
    setCurrentUser,
    users,
    loading,
    refreshUsers: loadUsers,
    addUser,
    updateUser,
    deleteUser,
    // Auth session
    isAuthenticated,
    login,
    loginAsUser,
    logout,
    // Permissions
    isAdmin,
    isContributor,
    isViewer,
    canManageUsers,
    canManipulateTasks,
    canDeleteTasks
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
