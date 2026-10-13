import React, { useMemo } from 'react';
import { AlertTriangleIcon, CheckCircleIcon } from '../../common/Icons';

export function CapacityMandaysTab({ sprint, metrics, tasks }) {
  const isOverCapacity = metrics.isOverCapacity;

  // Tickets exceeding estimated mandays
  const ticketsExceedingMandays = useMemo(() => {
    return tasks.filter(t => {
      const planned = parseFloat(t.mandays) || 0;
      const consumed = parseFloat(t.consumed_mandays || t.mandays_consumption_se) || 0;
      return consumed > planned && planned > 0;
    });
  }, [tasks]);

  // Sort breakdown helper
  const getSortedBreakdown = (obj) => {
    return Object.entries(obj || {})
      .map(([name, val]) => ({ name, val: Math.round(val * 10) / 10 }))
      .sort((a, b) => b.val - a.val);
  };

  const platformBreakdown = useMemo(() => getSortedBreakdown(metrics.byPlatform), [metrics.byPlatform]);
  const pmBreakdown = useMemo(() => getSortedBreakdown(metrics.byPM), [metrics.byPM]);
  const statusBreakdown = useMemo(() => getSortedBreakdown(metrics.byStatus), [metrics.byStatus]);
  const teamBreakdown = useMemo(() => getSortedBreakdown(metrics.byTeam), [metrics.byTeam]);

  return (
    <div className="capacity-mandays-tab animate-fade-in">
      {/* Over-Capacity Alert Banner */}
      {isOverCapacity && (
        <div className="capacity-alert-banner">
          <AlertTriangleIcon size={20} className="text-warning-icon" />
          <div className="alert-text-block">
            <strong>Capacity Overrun Warning</strong>
            <p>
              Planned mandays ({metrics.plannedMandays} MD) exceed the agreed sprint capacity of {sprint.capacity} MD by {Math.abs(metrics.remainingCapacity)} MD (Utilization: {metrics.utilizationRate}%). Consider moving non-critical scope to the next sprint or re-negotiating capacity.
            </p>
          </div>
        </div>
      )}

      {/* Top 5 KPI Widgets */}
      <div className="capacity-kpi-grid">
        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Sprint Capacity</span>
            <span className="kpi-icon-pill">⚡</span>
          </div>
          <div className="kpi-card-value">{sprint.capacity} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Max team commitment</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Planned Mandays</span>
            <span className="kpi-icon-pill">⏱️</span>
          </div>
          <div className="kpi-card-value">{metrics.plannedMandays} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Sum of estimated ticket MD</div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Consumed Mandays</span>
            <span className="kpi-icon-pill">🔥</span>
          </div>
          <div className="kpi-card-value">{metrics.consumedMandays} <span className="kpi-unit">MD</span></div>
          <div className="kpi-card-sub">Engineering & QA logged effort</div>
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
            {metrics.remainingCapacity < 0 ? 'Exceeded limit' : 'Available buffer'}
          </div>
        </div>

        <div className="kpi-card card-styled">
          <div className="kpi-card-head">
            <span className="kpi-title">Utilization Rate</span>
            <span className="kpi-icon-pill">📊</span>
          </div>
          <div className={`kpi-card-value ${isOverCapacity ? 'text-warning' : 'text-primary'}`}>
            {metrics.utilizationRate}%
          </div>
          <div className="kpi-card-sub">Target threshold: 90%–100%</div>
        </div>
      </div>

      {/* Utilization Visual Progress Strip */}
      <div className="utilization-strip-card card-styled">
        <div className="utilization-label-row">
          <span>Overall Sprint Capacity Utilization</span>
          <span className="utilization-stat-bold">
            {metrics.plannedMandays} / {sprint.capacity} MD ({metrics.utilizationRate}%)
          </span>
        </div>
        <div className="progress-bar-track lg">
          <div
            className={`progress-bar-fill ${isOverCapacity ? 'fill-warning' : 'fill-primary'}`}
            style={{ width: `${Math.min(100, metrics.utilizationRate)}%` }}
          />
        </div>
      </div>

      {/* 4 Breakdown Sections */}
      <div className="breakdown-quad-grid">
        {/* 1. Mandays by Platform */}
        <div className="breakdown-card card-styled">
          <div className="breakdown-header">
            <h4>Mandays by Platform</h4>
            <span className="breakdown-sub">{platformBreakdown.length} Platforms</span>
          </div>
          <div className="breakdown-bars-stack">
            {platformBreakdown.map(item => {
              const pct = metrics.plannedMandays > 0 ? Math.round((item.val / metrics.plannedMandays) * 100) : 0;
              return (
                <div key={item.name} className="breakdown-bar-row">
                  <div className="breakdown-row-labels">
                    <span className="label-name">{item.name}</span>
                    <span className="label-val">{item.val} MD ({pct}%)</span>
                  </div>
                  <div className="progress-bar-track mini">
                    <div className="progress-bar-fill fill-platform" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Mandays by Product Manager */}
        <div className="breakdown-card card-styled">
          <div className="breakdown-header">
            <h4>Mandays by Product Manager</h4>
            <span className="breakdown-sub">{pmBreakdown.length} Product Managers</span>
          </div>
          <div className="breakdown-bars-stack">
            {pmBreakdown.map(item => {
              const pct = metrics.plannedMandays > 0 ? Math.round((item.val / metrics.plannedMandays) * 100) : 0;
              return (
                <div key={item.name} className="breakdown-bar-row">
                  <div className="breakdown-row-labels">
                    <span className="label-name">{item.name}</span>
                    <span className="label-val">{item.val} MD ({pct}%)</span>
                  </div>
                  <div className="progress-bar-track mini">
                    <div className="progress-bar-fill fill-pm" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Mandays by Ticket Status */}
        <div className="breakdown-card card-styled">
          <div className="breakdown-header">
            <h4>Mandays by Ticket Status</h4>
            <span className="breakdown-sub">{statusBreakdown.length} Statuses</span>
          </div>
          <div className="breakdown-bars-stack">
            {statusBreakdown.map(item => {
              const pct = metrics.plannedMandays > 0 ? Math.round((item.val / metrics.plannedMandays) * 100) : 0;
              return (
                <div key={item.name} className="breakdown-bar-row">
                  <div className="breakdown-row-labels">
                    <span className="label-name">{item.name}</span>
                    <span className="label-val">{item.val} MD ({pct}%)</span>
                  </div>
                  <div className="progress-bar-track mini">
                    <div className="progress-bar-fill fill-status" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Mandays by Development Team */}
        <div className="breakdown-card card-styled">
          <div className="breakdown-header">
            <h4>Mandays by Development Team</h4>
            <span className="breakdown-sub">{teamBreakdown.length} Engineers</span>
          </div>
          <div className="breakdown-bars-stack">
            {teamBreakdown.map(item => {
              const pct = metrics.plannedMandays > 0 ? Math.round((item.val / metrics.plannedMandays) * 100) : 0;
              return (
                <div key={item.name} className="breakdown-bar-row">
                  <div className="breakdown-row-labels">
                    <span className="label-name">{item.name}</span>
                    <span className="label-val">{item.val} MD ({pct}%)</span>
                  </div>
                  <div className="progress-bar-track mini">
                    <div className="progress-bar-fill fill-team" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tickets Exceeding Estimated Mandays */}
      <div className="exceeding-tickets-card card-styled">
        <div className="exceeding-header-row">
          <div className="title-wrap">
            <h4>Tickets Exceeding Estimated Mandays</h4>
            <p className="text-muted">Tickets where actual consumed mandays have surpassed the original estimate</p>
          </div>
          <span className="badge-count-warning">
            {ticketsExceedingMandays.length} Overrunning Tickets
          </span>
        </div>

        {ticketsExceedingMandays.length === 0 ? (
          <div className="no-exceeded-box">
            <CheckCircleIcon size={20} className="text-success" />
            <span>All active tickets are executing within their allocated manday estimates.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="exceeded-tickets-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Assignee</th>
                  <th>Planned MD</th>
                  <th>Consumed MD</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ticketsExceedingMandays.map(t => {
                  const planned = parseFloat(t.mandays) || 0;
                  const consumed = parseFloat(t.consumed_mandays || t.mandays_consumption_se) || 0;
                  const variance = Math.round((consumed - planned) * 10) / 10;

                  return (
                    <tr key={t.id}>
                      <td><span className="code-chip">{t.ticket_code || t.code || 'S-TKT'}</span></td>
                      <td><strong>{t.title}</strong></td>
                      <td>{t.platforms || t.platform || 'General'}</td>
                      <td>{t.assignees || t.assignee || 'Unassigned'}</td>
                      <td>{planned} MD</td>
                      <td className="text-danger font-semibold">{consumed} MD</td>
                      <td><span className="variance-tag text-danger">+{variance} MD</span></td>
                      <td><span className="cell-status-chip">{t.ticket_status || t.stage}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
