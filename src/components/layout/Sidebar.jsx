import React from 'react';
import { VIEWS } from '../../constants';
import { StarIcon, HomeIcon, BoardIcon, ListIcon, UsersIcon, CalendarIcon, SettingsIcon } from '../common/Icons';

export function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-top">
        <div className="brand-mark" title="NovaBoard">
          <StarIcon />
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-icon-btn ${currentView === VIEWS.OVERVIEW ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.OVERVIEW)}
            title="Overview"
            aria-label="Overview"
          >
            <HomeIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.BOARD ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.BOARD)}
            title="Kanban Board"
            aria-label="Kanban Board"
          >
            <BoardIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.LIST ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.LIST)}
            title="Task List"
            aria-label="Task List"
          >
            <ListIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.OVERVIEW ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.OVERVIEW)}
            title="Team & Workload"
            aria-label="Team & Workload"
          >
            <UsersIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.CALENDAR ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.CALENDAR)}
            title="Calendar Timeline"
            aria-label="Calendar Timeline"
          >
            <CalendarIcon />
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="nav-icon-btn" title="Settings" aria-label="Settings">
          <SettingsIcon />
        </button>
      </div>
    </aside>
  );
}
