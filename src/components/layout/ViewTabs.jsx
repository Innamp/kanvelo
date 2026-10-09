import React from 'react';
import { VIEWS } from '../../constants';

export function ViewTabs({ currentView, onViewChange }) {
  const tabs = [
    {
      key: VIEWS.OVERVIEW,
      label: 'Overview',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect width="18" height="18" x="3" y="3" rx="3" /><path d="M9 3v18" /><path d="M15 3v18" />
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
        </svg>
      )
    },
    {
      key: VIEWS.DOCUMENTS,
      label: 'Documents',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      )
    },
    {
      key: VIEWS.MESSAGES,
      label: 'Messages',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
