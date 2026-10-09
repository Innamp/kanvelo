import React from 'react';
import { SearchIcon, BellIcon } from '../common/Icons';

export function Header({ search, onSearchChange }) {
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
        <button className="bell-btn" title="Notifications" aria-label="Notifications">
          <BellIcon />
          <span className="unread-dot" aria-hidden="true" />
        </button>

        <div className="user-profile-chip" tabIndex={0} role="button" aria-label="User Profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
            alt="John Doe"
            className="user-avatar-img"
          />
          <span className="user-profile-name">John Doe</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}
