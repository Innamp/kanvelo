import React from 'react';
import { SPRINT_HEALTH } from '../../../constants/sprintConstants';
import { AlertTriangleIcon, CheckCircleIcon, ArrowRightIcon } from '../../common/Icons';

export function OverviewTab({ sprint, metrics, onTabChange }) {
  const healthClass = `health-${(sprint.health || 'on track').toLowerCase().replace(' ', '-')}`;

  return (
    <div className="sprint-overview-tab animate-fade-in">
      {/* Top Health & Objective Banner */}
      <div className="overview-hero-card card-styled">
        <div className="hero-content-left">
          <div className="hero-status-row">
            <span className={`sprint-health-pill ${healthClass}`}>
              Health: {sprint.health || SPRINT_HEALTH.ON_TRACK}
            </span>
            <span className="hero-phase-badge">
              Current Phase: <strong>{sprint.currentPhase}</strong>
            </span>
            <span className="hero-date-badge">
              {sprint.startDate} → {sprint.endDate}
            </span>
          </div>

          <h2 className="hero-objective-title">Sprint Objective</h2>
          <p className="hero-objective-text">{sprint.goal}</p>

          <div className="hero-meta-footer">
            <span>Sprint Owner: <strong>{sprint.owner || 'Inna MP'}</strong></span>
            <span>•</span>
            <span>Sprint Year: <strong>{sprint.year}</strong></span>
            <span>•</span>
            <span>Overall Progress: <strong>{metrics.completionRate}%</strong></span>
          </div>
        </div>

        <div className="hero-progress-ring-card">
          <div className="circular-gauge-wrap">
            <svg className="circular-gauge-svg" viewBox="0 0 96 96">
              <circle className="gauge-bg-circle" cx="48" cy="48" r="38" strokeWidth="8" fill="none" />
              <circle
                className="gauge-progress-circle"
                cx="48"
                cy="48"
                r="38"
                strokeWidth="8"
                fill="none"
                strokeDasharray="239"
                strokeDashoffset={239 - (239 * Math.min(100, metrics.completionRate)) / 100}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="gauge-inner-content">
              <span className="gauge-num">{metrics.completionRate}%</span>
              <span className="gauge-label">Delivery</span>
            </div>
          </div>
          <span className="ring-subtext">{metrics.deployedTickets} of {metrics.totalTickets} tickets delivered</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="overview-kpis-grid">
        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Total Tickets</span>
            <span className="kpi-icon-pill">🎫</span>
          </div>
          <div className="kpi-card-value">{metrics.totalTickets}</div>
          <div className="kpi-card-sub">Active in this sprint</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Planned Mandays</span>
            <span className="kpi-icon-pill">⏱️</span>
          </div>
          <div className="kpi-card-value">{metrics.plannedMandays} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Total estimated effort</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Sprint Capacity</span>
            <span className="kpi-icon-pill">⚡</span>
          </div>
          <div className="kpi-card-value">{sprint.capacity} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Allocated team velocity</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Consumed Mandays</span>
            <span className="kpi-icon-pill">🔥</span>
          </div>
          <div className="kpi-card-value">{metrics.consumedMandays} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Spent to date</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Remaining Capacity</span>
            <span className="kpi-icon-pill">🔋</span>
          </div>
          <div className={`kpi-card-value ${metrics.remainingCapacity < 0 ? 'text-danger' : 'text-success'}`}>
            {metrics.remainingCapacity} <span className="kpi-unit">MD</span>
          </div>
          <div className="kpi-card-sub">
            {metrics.remainingCapacity < 0 ? 'Capacity overrun!' : 'Available margin'}
          </div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Utilization</span>
            <span className="kpi-icon-pill">📊</span>
          </div>
          <div className={`kpi-card-value ${metrics.isOverCapacity ? 'text-warning' : ''}`}>
            {metrics.utilizationRate}%
          </div>
          <div className="kpi-card-sub">Planned vs Capacity</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Deployed Tickets</span>
            <span className="kpi-icon-pill">🚀</span>
          </div>
          <div className="kpi-card-value text-success">{metrics.deployedTickets}</div>
          <div className="kpi-card-sub">Production releases</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Ready to Deploy</span>
            <span className="kpi-icon-pill">📦</span>
          </div>
          <div className="kpi-card-value text-teal">{metrics.readyToDeployTickets}</div>
          <div className="kpi-card-sub">Awaiting release window</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Carry-Over Tickets</span>
            <span className="kpi-icon-pill">🔁</span>
          </div>
          <div className="kpi-card-value text-warning">{metrics.carryOverTickets}</div>
          <div className="kpi-card-sub">Cross-sprint movements</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Deprioritized</span>
            <span className="kpi-icon-pill">⏸️</span>
          </div>
          <div className="kpi-card-value text-muted">{metrics.deprioritizedTickets}</div>
          <div className="kpi-card-sub">Deferred or postponed</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Cancelled</span>
            <span className="kpi-icon-pill">❌</span>
          </div>
          <div className="kpi-card-value text-danger">{metrics.cancelledTickets}</div>
          <div className="kpi-card-sub">Terminated tickets</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Overdue Tickets</span>
            <span className="kpi-icon-pill">⚠️</span>
          </div>
          <div className={`kpi-card-value ${metrics.overdueTickets > 0 ? 'text-danger' : 'text-muted'}`}>
            {metrics.overdueTickets}
          </div>
          <div className="kpi-card-sub">Missed target dates</div>
        </div>
      </div>

      {/* Risks, Dependencies, and Remarks Section */}
      <div className="overview-details-grid">
        <div className="details-card card-styled">
          <div className="details-card-header">
            <AlertTriangleIcon size={18} className="text-warning" />
            <h3>Key Risks & Mitigations</h3>
          </div>
          <div className="details-card-body">
            {sprint.risks ? (
              <p className="card-prose-text">{sprint.risks}</p>
            ) : (
              <p className="text-muted">No high severity risks identified for this sprint cycle.</p>
            )}
          </div>
        </div>

        <div className="details-card card-styled">
          <div className="details-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <h3>Dependencies & Integrations</h3>
          </div>
          <div className="details-card-body">
            {sprint.dependencies ? (
              <p className="card-prose-text">{sprint.dependencies}</p>
            ) : (
              <p className="text-muted">Direct commercial backoffice scope. No external vendor blockers.</p>
            )}
          </div>
        </div>

        <div className="details-card card-styled full-width-card">
          <div className="details-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3>Important Remarks & Governance Notes</h3>
          </div>
          <div className="details-card-body">
            {sprint.remarks ? (
              <p className="card-prose-text">{sprint.remarks}</p>
            ) : (
              <p className="text-muted">All phase gates subject to PMO review and sign-off criteria.</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Shortcuts */}
      <div className="overview-shortcuts-strip card-styled">
        <span className="shortcuts-label">Quick Actions:</span>
        <button className="shortcut-pill-btn" onClick={() => onTabChange('phases')}>
          View 11 Phases & Gantt Stepper →
        </button>
        <button className="shortcut-pill-btn" onClick={() => onTabChange('tickets')}>
          View {metrics.totalTickets} Sprint Tickets →
        </button>
        <button className="shortcut-pill-btn" onClick={() => onTabChange('kanban')}>
          Open 11-Stage Kanban →
        </button>
        <button className="shortcut-pill-btn" onClick={() => onTabChange('capacity')}>
          Analyze Capacity & Mandays →
        </button>
        <button className="shortcut-pill-btn" onClick={() => onTabChange('deployment')}>
          Review Deployment Readiness →
        </button>
      </div>
    </div>
  );
}
