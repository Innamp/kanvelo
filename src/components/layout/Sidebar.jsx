import React from 'react';
import { VIEWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import {
  PhilipMorrisLogo,
  HomeIcon,
  LayersIcon,
  InboxIcon,
  CheckCircleIcon,
  BoardIcon,
  GitBranchIcon,
  CalendarIcon,
  BarChartIcon,
  SlidersIcon,
  UsersIcon,
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
            className={`nav-icon-btn ${currentView === VIEWS.DASHBOARD ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.DASHBOARD)}
            title="Dashboard"
            aria-label="Dashboard"
          >
            <HomeIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.SPRINTS || currentView === VIEWS.SPRINT_DETAIL ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.SPRINTS)}
            title="Sprints (Sprint 1 - 10)"
            aria-label="Sprints"
          >
            <LayersIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.BACKLOG ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.BACKLOG)}
            title="Backlog"
            aria-label="Backlog"
          >
            <InboxIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.TICKET_LIST ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.TICKET_LIST)}
            title="Ticket List"
            aria-label="Ticket List"
          >
            <CheckCircleIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.KANBAN ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.KANBAN)}
            title="Kanban Board"
            aria-label="Kanban Board"
          >
            <BoardIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.TIMELINE ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.TIMELINE)}
            title="Timeline"
            aria-label="Timeline"
          >
            <GitBranchIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.CALENDAR ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.CALENDAR)}
            title="Calendar"
            aria-label="Calendar"
          >
            <CalendarIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.REPORTS ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.REPORTS)}
            title="Reports & Sprint Comparison"
            aria-label="Reports"
          >
            <BarChartIcon />
          </button>

          <button
            className={`nav-icon-btn ${currentView === VIEWS.CONFIGURATION ? 'active' : ''}`}
            onClick={() => onViewChange(VIEWS.CONFIGURATION)}
            title="Sprint Configuration"
            aria-label="Configuration"
          >
            <SlidersIcon />
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
