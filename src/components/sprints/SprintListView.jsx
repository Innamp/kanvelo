import React, { useState, useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { SPRINT_STATUSES, SPRINT_PHASE_NAMES, DEPLOYMENT_READINESS } from '../../constants/sprintConstants';
import { LayersIcon, FilterIcon, ArrowRightIcon, AlertTriangleIcon } from '../common/Icons';

export function SprintListView({ onSelectSprint }) {
  const { sprints, getSprintMetrics, openSprintDetail } = useSprint();

  // Filters state
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterPM, setFilterPM] = useState('all');
  const [filterReadiness, setFilterReadiness] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'rows'

  // Pre-calculate metrics for all sprints
  const sprintDataWithMetrics = useMemo(() => {
    return sprints.map(sprint => {
      const metrics = getSprintMetrics(sprint.id);
      return { sprint, metrics };
    });
  }, [sprints, getSprintMetrics]);

  // Extract unique platforms and PMs across all sprints for filter options
  const { platforms, productManagers, years } = useMemo(() => {
    const pSet = new Set();
    const pmSet = new Set();
    const ySet = new Set();

    sprintDataWithMetrics.forEach(({ sprint, metrics }) => {
      if (sprint.year) ySet.add(sprint.year.toString());
      Object.keys(metrics.byPlatform || {}).forEach(p => pSet.add(p));
      Object.keys(metrics.byPM || {}).forEach(pm => pmSet.add(pm));
    });

    return {
      platforms: Array.from(pSet).sort(),
      productManagers: Array.from(pmSet).sort(),
      years: Array.from(ySet).sort()
    };
  }, [sprintDataWithMetrics]);

  // Filtered sprints
  const filteredSprintItems = useMemo(() => {
    return sprintDataWithMetrics.filter(({ sprint, metrics }) => {
      // Year filter
      if (filterYear !== 'all' && sprint.year?.toString() !== filterYear) return false;

      // Status filter
      if (filterStatus !== 'all' && sprint.status !== filterStatus) return false;

      // Phase filter
      if (filterPhase !== 'all' && sprint.currentPhase !== filterPhase) return false;

      // Platform filter
      if (filterPlatform !== 'all' && !(metrics.byPlatform && metrics.byPlatform[filterPlatform])) return false;

      // PM filter
      if (filterPM !== 'all' && !(metrics.byPM && metrics.byPM[filterPM])) return false;

      // Deployment readiness filter
      if (filterReadiness !== 'all') {
        if (filterReadiness === 'Ready' && metrics.readyToDeployTickets === 0) return false;
        if (filterReadiness === 'Deployed' && metrics.deployedTickets === 0) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = sprint.name.toLowerCase().includes(q);
        const matchesGoal = (sprint.goal || '').toLowerCase().includes(q);
        const matchesOwner = (sprint.owner || '').toLowerCase().includes(q);
        if (!matchesName && !matchesGoal && !matchesOwner) return false;
      }

      return true;
    });
  }, [sprintDataWithMetrics, filterYear, filterStatus, filterPhase, filterPlatform, filterPM, filterReadiness, search]);

  const handleSprintClick = (sprintId) => {
    openSprintDetail(sprintId);
    if (onSelectSprint) onSelectSprint(sprintId);
  };

  const resetFilters = () => {
    setFilterYear('all');
    setFilterStatus('all');
    setFilterPhase('all');
    setFilterPlatform('all');
    setFilterPM('all');
    setFilterReadiness('all');
    setSearch('');
  };

  const hasActiveFilters = filterYear !== 'all' || filterStatus !== 'all' || filterPhase !== 'all' ||
    filterPlatform !== 'all' || filterPM !== 'all' || filterReadiness !== 'all' || search !== '';

  return (
    <div className="sprint-list-page animate-fade-in">
      {/* Header with Title & Action */}
      <div className="sprint-list-header">
        <div className="sprint-list-title-wrap">
          <div className="sprint-badge-icon">
            <LayersIcon size={24} />
          </div>
          <div>
            <h1 className="sprint-list-title">Sprint Management</h1>
            <p className="sprint-list-subtitle">
              Monitor, plan, and analyze execution performance across Sprint 1 to Sprint 10
            </p>
          </div>
        </div>

        <div className="sprint-list-actions">
          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              Cards
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'rows' ? 'active' : ''}`}
              onClick={() => setViewMode('rows')}
              title="Table / Row View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Rows
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="sprint-filter-panel card-styled">
        <div className="sprint-filter-grid">
          {/* Search */}
          <div className="sprint-filter-item search-item">
            <label>Search Sprints</label>
            <div className="filter-input-wrap">
              <input
                type="text"
                placeholder="Search sprint name, goal, owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="filter-select-input"
              />
            </div>
          </div>

          {/* Year */}
          <div className="sprint-filter-item">
            <label>Year</label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="sprint-filter-item">
            <label>Sprint Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All Statuses</option>
              {Object.values(SPRINT_STATUSES).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Phase */}
          <div className="sprint-filter-item">
            <label>Current Phase</label>
            <select
              value={filterPhase}
              onChange={e => setFilterPhase(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All Phases</option>
              {SPRINT_PHASE_NAMES.map(ph => (
                <option key={ph} value={ph}>{ph}</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="sprint-filter-item">
            <label>Platform</label>
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Product Manager */}
          <div className="sprint-filter-item">
            <label>Product Manager</label>
            <select
              value={filterPM}
              onChange={e => setFilterPM(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All PMs</option>
              {productManagers.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* Deployment Readiness */}
          <div className="sprint-filter-item">
            <label>Deployment</label>
            <select
              value={filterReadiness}
              onChange={e => setFilterReadiness(e.target.value)}
              className="filter-select-input"
            >
              <option value="all">All States</option>
              <option value="Ready">Has Ready to Deploy</option>
              <option value="Deployed">Has Deployed Tickets</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="filter-active-bar">
            <span className="filter-count-badge">Showing {filteredSprintItems.length} of {sprints.length} sprints</span>
            <button className="filter-reset-link" onClick={resetFilters}>
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Sprint Cards Grid View */}
      {viewMode === 'grid' && (
        <div className="sprint-cards-grid">
          {filteredSprintItems.map(({ sprint, metrics }) => {
            const isOverCapacity = metrics.isOverCapacity;
            const statusClass = `status-${sprint.status.toLowerCase()}`;
            const healthClass = `health-${(sprint.health || 'on track').toLowerCase().replace(' ', '-')}`;

            return (
              <div
                key={sprint.id}
                className={`sprint-summary-card card-styled ${sprint.status === SPRINT_STATUSES.ACTIVE ? 'is-active-sprint' : ''}`}
                onClick={() => handleSprintClick(sprint.id)}
                role="button"
                tabIndex={0}
              >
                {/* Card Header */}
                <div className="card-top-bar">
                  <div className="sprint-identity">
                    <span className="sprint-num-badge">#{sprint.number}</span>
                    <h3 className="sprint-card-title">{sprint.name}</h3>
                    <span className="sprint-year-tag">{sprint.year}</span>
                  </div>

                  <div className="sprint-status-tags">
                    <span className={`sprint-status-pill ${statusClass}`}>{sprint.status}</span>
                    {sprint.health && (
                      <span className={`sprint-health-pill ${healthClass}`}>
                        {sprint.health}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dates & Phase */}
                <div className="sprint-dates-phase-row">
                  <div className="sprint-dates-text">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{sprint.startDate} → {sprint.endDate}</span>
                  </div>
                  <div className="sprint-current-phase-badge" title="Current sprint phase">
                    <span className="phase-indicator-dot"></span>
                    <span>{sprint.currentPhase}</span>
                  </div>
                </div>

                {/* Capacity & Mandays KPI block */}
                <div className="sprint-kpi-metric-strip">
                  <div className="kpi-mini-box">
                    <span className="kpi-mini-label">Tickets</span>
                    <span className="kpi-mini-val">{metrics.totalTickets}</span>
                  </div>
                  <div className="kpi-mini-box">
                    <span className="kpi-mini-label">Planned MD</span>
                    <span className="kpi-mini-val">{metrics.plannedMandays}</span>
                  </div>
                  <div className="kpi-mini-box">
                    <span className="kpi-mini-label">Consumed MD</span>
                    <span className="kpi-mini-val">{metrics.consumedMandays}</span>
                  </div>
                  <div className="kpi-mini-box">
                    <span className="kpi-mini-label">Capacity</span>
                    <span className="kpi-mini-val">{sprint.capacity} MD</span>
                  </div>
                  <div className="kpi-mini-box">
                    <span className="kpi-mini-label">Remaining</span>
                    <span className={`kpi-mini-val ${metrics.remainingCapacity < 0 ? 'text-danger' : ''}`}>
                      {metrics.remainingCapacity} MD
                    </span>
                  </div>
                </div>

                {/* Capacity Utilization Progress Bar */}
                <div className="capacity-bar-section">
                  <div className="capacity-bar-labels">
                    <span>Utilization ({metrics.utilizationRate}%)</span>
                    {isOverCapacity && (
                      <span className="over-capacity-warning" title="Planned mandays exceed sprint capacity!">
                        <AlertTriangleIcon size={12} /> Exceeds Capacity
                      </span>
                    )}
                    <span>Completion: {metrics.completionRate}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${isOverCapacity ? 'fill-warning' : 'fill-primary'}`}
                      style={{ width: `${Math.min(100, metrics.utilizationRate)}%` }}
                    />
                  </div>
                </div>

                {/* Ticket Status Breakdown Pills */}
                <div className="sprint-ticket-states-grid">
                  <span className="status-counter-pill state-deployed" title="Deployed tickets">
                    🚀 {metrics.deployedTickets} Deployed
                  </span>
                  <span className="status-counter-pill state-dev" title="In Development">
                    ⚙️ {metrics.devTickets} Dev
                  </span>
                  <span className="status-counter-pill state-uat" title="In UAT">
                    🧪 {metrics.uatTickets} UAT
                  </span>
                  <span className="status-counter-pill state-carryover" title="Carry-over tickets">
                    🔁 {metrics.carryOverTickets} Carry Over
                  </span>
                  <span className="status-counter-pill state-deprioritized" title="Deprioritized">
                    ⏸️ {metrics.deprioritizedTickets} Deprio
                  </span>
                  {metrics.overdueTickets > 0 && (
                    <span className="status-counter-pill state-overdue" title="Overdue tickets">
                      ⚠️ {metrics.overdueTickets} Overdue
                    </span>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="card-footer-action">
                  <span className="sprint-owner-text">Owner: {sprint.owner || 'Inna MP'}</span>
                  <span className="open-detail-link">
                    Open Sprint <ArrowRightIcon size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sprint Table / Row View */}
      {viewMode === 'rows' && (
        <div className="sprint-rows-table-wrap card-styled">
          <table className="sprint-rows-table">
            <thead>
              <tr>
                <th>Sprint</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Timeline</th>
                <th>Tickets</th>
                <th>Planned MD</th>
                <th>Consumed MD</th>
                <th>Capacity</th>
                <th>Utilization</th>
                <th>Completion</th>
                <th>Dev / UAT / Deployed</th>
                <th>Carry Over</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSprintItems.map(({ sprint, metrics }) => {
                const statusClass = `status-${sprint.status.toLowerCase()}`;
                const isOver = metrics.isOverCapacity;

                return (
                  <tr
                    key={sprint.id}
                    className={`sprint-table-row ${sprint.status === SPRINT_STATUSES.ACTIVE ? 'is-active-row' : ''}`}
                    onClick={() => handleSprintClick(sprint.id)}
                  >
                    <td>
                      <div className="cell-sprint-id">
                        <strong>{sprint.name}</strong>
                        <span className="cell-sub-year">{sprint.year}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sprint-status-pill ${statusClass}`}>{sprint.status}</span>
                    </td>
                    <td>
                      <span className="cell-phase-name">{sprint.currentPhase}</span>
                    </td>
                    <td>
                      <span className="cell-timeline-text">{sprint.startDate} – {sprint.endDate}</span>
                    </td>
                    <td><strong>{metrics.totalTickets}</strong></td>
                    <td>{metrics.plannedMandays} MD</td>
                    <td>{metrics.consumedMandays} MD</td>
                    <td>{sprint.capacity} MD</td>
                    <td>
                      <span className={`cell-utilization-badge ${isOver ? 'badge-danger' : 'badge-ok'}`}>
                        {metrics.utilizationRate}%
                      </span>
                    </td>
                    <td>{metrics.completionRate}%</td>
                    <td>
                      <span className="sub-stat-chips">
                        <span className="chip-dev">{metrics.devTickets}D</span>
                        <span className="chip-uat">{metrics.uatTickets}U</span>
                        <span className="chip-dep">{metrics.deployedTickets}R</span>
                      </span>
                    </td>
                    <td>
                      {metrics.carryOverTickets > 0 ? (
                        <span className="chip-carryover">{metrics.carryOverTickets}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-action-open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSprintClick(sprint.id);
                        }}
                      >
                        Detail →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
