import React from 'react';
import { VIEWS } from '../../constants';

export function ViewTabs({ currentView, onViewChange }) {
  const tabs = [
    {
      key: VIEWS.OVERVIEW,
      label: 'Overview',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" />
        </svg>
      )
    },
    {
      key: VIEWS.LIST,
      label: 'List',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      )
    },
    {
      key: VIEWS.BOARD,
      label: 'Board',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="6" x2="6" y1="4" y2="20" strokeLinecap="round" />
          <line x1="12" x2="12" y1="8" y2="20" strokeLinecap="round" />
          <line x1="18" x2="18" y1="4" y2="16" strokeLinecap="round" />
          <circle cx="6" cy="8" r="2" fill="currentColor" />
          <circle cx="12" cy="14" r="2" fill="currentColor" />
          <circle cx="18" cy="10" r="2" fill="currentColor" />
        </svg>
      )
    },
    {
      key: VIEWS.CALENDAR,
      label: 'Calendar',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
          <text x="8.5" y="17.5" fill="currentColor" fontSize="7" fontWeight="bold" stroke="none">07</text>
        </svg>
      )
    },
    {
      key: VIEWS.DOCUMENTS,
      label: 'Documents',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      key: VIEWS.MESSAGES,
      label: 'Messages',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      )
    }
  ];

  return (
    <nav className="view-tabs-bar" aria-label="Views">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tab-btn ${currentView === tab.key ? 'active' : ''}`}
          onClick={() => onViewChange(tab.key)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
