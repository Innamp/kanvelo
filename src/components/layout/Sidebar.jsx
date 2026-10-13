import React from 'react';
import { VIEWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import {
  PhilipMorrisLogo,
  HomeIcon,
  BoardIcon,
  CheckCircleIcon,
  UsersIcon,
  CalendarIcon,
  SettingsIcon,
  HeadsetIcon,
  LogoutIcon
} from '../common/Icons';

export function Sidebar({ currentView, onViewChange, onOpenUserControl }) {
  const { logout } = useAuth();

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-top">
        <div className="brand-mark" title="Philip Morris International">
          <PhilipMorrisLogo size={30} />
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
            <CheckCircleIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.USERS ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.USERS)}
            title="User Control Panel"
            aria-label="User Control Panel"
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
        <button
          className={`nav-icon-btn ${currentView === VIEWS.USERS ? 'active' : ''}`}
          onClick={() => onViewChange(VIEWS.USERS)}
          title="User Control Panel"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>
        <button className="nav-icon-btn" title="Customer Support" aria-label="Customer Support">
          <HeadsetIcon size={18} />
        </button>
        <button className="nav-icon-btn" title="Sign Out" aria-label="Sign Out" onClick={logout}>
          <LogoutIcon size={18} />
        </button>
      </div>
    </aside>
  );
}
