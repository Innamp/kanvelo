import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, BellIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants';

export function Header({ search, onSearchChange, onOpenUserControl }) {
  const { currentUser, users, setCurrentUser, canManageUsers, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="workspace-header">
      <div className="search-field-wrapper">
        <SearchIcon />
        <input
          type="text"
          id="headerSearchInput"
          className="search-field-input"
          placeholder="Search a task..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
        <span className="search-kbd-badge">⌘S</span>
      </div>

      <div className="header-user-section">
        {canManageUsers && (
          <button
            type="button"
            className="header-uc-quick-btn"
            onClick={onOpenUserControl}
            title="Open User Control Panel (Manage Users & Roles)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>User Control</span>
          </button>
        )}

        <button className="bell-btn" title="Notifications" aria-label="Notifications" type="button">
          <BellIcon />
          <span className="unread-dot" aria-hidden="true" />
        </button>

        {/* User Profile Chip with Dropdown */}
        <div className="user-profile-wrapper" ref={menuRef}>
          <div
            className="user-profile-chip"
            tabIndex={0}
            role="button"
            aria-label="User Profile and Role Menu"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'}
              alt={currentUser?.name || 'User'}
              className="user-avatar-img"
            />
            <div className="user-profile-text-wrap">
              <span className="user-profile-name">{currentUser?.name || 'John Doe'}</span>
              <span className={`user-header-role-badge role-${currentUser?.role}`}>
                {ROLE_LABELS[currentUser?.role] || 'Admin'}
              </span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`user-chevron ${menuOpen ? 'rotated' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {menuOpen && (
            <div className="user-dropdown-popover">
              <div className="dropdown-user-summary">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="dropdown-avatar-lg"
                />
                <div className="dropdown-user-details">
                  <strong>{currentUser?.name}</strong>
                  <span>{currentUser?.email}</span>
                  <span className={`role-pill-lg role-${currentUser?.role}`}>
                    {ROLE_LABELS[currentUser?.role]}
                  </span>
                </div>
              </div>

              {/* User Control Panel Button */}
              {canManageUsers && (
                <div className="dropdown-admin-actions">
                  <button
                    className="btn-admin-panel"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenUserControl();
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    User Control Panel
                  </button>
                </div>
              )}

              {/* Quick Switch Profile / Roles for testing */}
              <div className="dropdown-switch-section">
                <span className="switch-heading">Switch Active Profile</span>
                <div className="profile-switch-list">
                  {users.map(u => (
                    <button
                      key={u.id}
                      className={`switch-user-btn ${u.id === currentUser?.id ? 'active' : ''}`}
                      type="button"
                      onClick={() => {
                        setCurrentUser(u);
                        setMenuOpen(false);
                      }}
                    >
                      <img src={u.avatar} alt={u.name} className="switch-avatar" />
                      <div className="switch-info">
                        <strong>{u.name}</strong>
                        <span className={`role-dot role-${u.role}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </div>
                      {u.id === currentUser?.id && <span className="switch-active-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="dropdown-logout-section">
                <button
                  type="button"
                  className="btn-logout"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
