import React from 'react';
import { SettingsIcon } from '../common/Icons';
import { Avatar } from '../common/Avatar';
import { useToast } from '../../context/ToastContext';

export function ProjectBanner() {
  const { showToast } = useToast();

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Dashboard link copied to clipboard!');
  };

  return (
    <section className="project-banner">
      <div className="project-title-group">
        <h1>Kanvelo</h1>
        <div className="project-meta-line">
          <span>Client: <strong style={{ color: 'var(--text-primary)' }}>Arcadia Solutions</strong></span>
          <span>•</span>
          <span>Timeline: <strong style={{ color: 'var(--text-primary)' }}>May 20 – June 30, 2025</strong></span>
          <span>•</span>
          <span className="meta-status-pill">In Progress</span>
        </div>
      </div>

      <div className="project-actions-group">
        <div className="avatar-group-stack">
          <Avatar name="Sarah Jenkins" size={30} className="avatar-stack-face" />
          <Avatar name="Alex Rivera" size={30} className="avatar-stack-face" />
          <Avatar name="Junaidi" size={30} className="avatar-stack-face" />
          <Avatar name="Felicia" size={30} className="avatar-stack-face" />
          <div className="avatar-stack-count">+5</div>
        </div>

        <button className="pill-action-btn" onClick={handleShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          Share
        </button>

        <button className="pill-action-btn" onClick={() => showToast('Settings opened')}>
          <SettingsIcon size={14} />
          Settings
        </button>

        <button className="pill-action-btn" onClick={() => showToast('Invite modal opened')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Invite People
        </button>
      </div>
    </section>
  );
}
