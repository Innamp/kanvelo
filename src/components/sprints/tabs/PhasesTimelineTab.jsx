import React, { useState, useMemo } from 'react';
import { PHASE_STATUSES } from '../../../constants/sprintConstants';
import { useSprint } from '../../../context/SprintContext';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircleIcon, AlertTriangleIcon } from '../../common/Icons';

export function PhasesTimelineTab({ sprint }) {
  const { updatePhase } = useSprint();
  const { canManageUsers } = useAuth(); // Admin / CI team permission
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);

  const phases = sprint.phases || [];

  // Color mapping based on requirement:
  // - Green: Completed
  // - Teal or blue: In Progress
  // - Grey: Not Started
  // - Orange: At Risk
  // - Red: Delayed or Blocked
  const getPhaseStatusTheme = (status) => {
    switch (status) {
      case PHASE_STATUSES.COMPLETED:
        return { label: 'Completed', colorClass: 'phase-completed', hex: '#10b981', badgeBg: 'rgba(16,185,129,0.12)' };
      case PHASE_STATUSES.IN_PROGRESS:
        return { label: 'In Progress', colorClass: 'phase-in-progress', hex: '#0284c7', badgeBg: 'rgba(2,132,199,0.12)' };
      case PHASE_STATUSES.DELAYED:
      case PHASE_STATUSES.BLOCKED:
        return { label: status, colorClass: 'phase-delayed-blocked', hex: '#ef4444', badgeBg: 'rgba(239,68,68,0.12)' };
      case 'At Risk':
        return { label: 'At Risk', colorClass: 'phase-at-risk', hex: '#f97316', badgeBg: 'rgba(249,115,22,0.12)' };
      case PHASE_STATUSES.NOT_APPLICABLE:
        return { label: 'N/A', colorClass: 'phase-na', hex: '#64748b', badgeBg: 'rgba(100,116,139,0.12)' };
      default:
        return { label: 'Not Started', colorClass: 'phase-not-started', hex: '#94a3b8', badgeBg: 'rgba(148,163,184,0.12)' };
    }
  };

  // Timeline calculation for Gantt view
  const timelineData = useMemo(() => {
    if (!phases.length) return { startTs: 0, endTs: 0, totalDays: 1, todayOffsetPct: 0 };

    let minDate = new Date(sprint.startDate || phases[0].plannedStartDate);
    let maxDate = new Date(sprint.endDate || phases[phases.length - 1].plannedEndDate);

    phases.forEach(p => {
      const pStart = new Date(p.plannedStartDate);
      const pEnd = new Date(p.plannedEndDate);
      if (pStart < minDate) minDate = pStart;
      if (pEnd > maxDate) maxDate = pEnd;
    });

    const startTs = minDate.getTime();
    const endTs = maxDate.getTime();
    const totalDuration = Math.max(1, endTs - startTs);

    const now = new Date();
    const todayTs = now.getTime();
    let todayOffsetPct = -1;
    if (todayTs >= startTs && todayTs <= endTs) {
      todayOffsetPct = ((todayTs - startTs) / totalDuration) * 100;
    } else if (todayTs > endTs) {
      todayOffsetPct = 100;
    }

    return {
      minDate,
      maxDate,
      startTs,
      endTs,
      totalDuration,
      todayOffsetPct
    };
  }, [phases, sprint]);

  const handleSavePhaseEdit = (e) => {
    e.preventDefault();
    if (!editingPhase) return;
    updatePhase(sprint.id, editingPhase.id, editingPhase);
    setEditingPhase(null);
  };

  return (
    <div className="phases-timeline-tab animate-fade-in">
      {/* Tab Header */}
      <div className="phases-header-row card-styled">
        <div className="phases-title-group">
          <h3>11 Sprint Lifecycle Phases</h3>
          <p>
            Track completion gates from BRD submission to production release notes
          </p>
        </div>

        {/* Legend */}
        <div className="phases-legend-bar">
          <span className="legend-chip"><span className="legend-dot dot-completed"></span> Completed</span>
          <span className="legend-chip"><span className="legend-dot dot-inprogress"></span> In Progress</span>
          <span className="legend-chip"><span className="legend-dot dot-notstarted"></span> Not Started</span>
          <span className="legend-chip"><span className="legend-dot dot-risk"></span> At Risk</span>
          <span className="legend-chip"><span className="legend-dot dot-delayed"></span> Delayed / Blocked</span>
        </div>
      </div>

      {/* HORIZONTAL STEPPER */}
      <div className="horizontal-stepper-container card-styled">
        <div className="stepper-title-row">
          <span className="stepper-headline">Phase Stepper</span>
          <span className="stepper-count">{phases.filter(p => p.status === PHASE_STATUSES.COMPLETED).length} of 11 Completed</span>
        </div>

        <div className="horizontal-stepper-scroll">
          <div className="stepper-track">
            {phases.map((phase, idx) => {
              const theme = getPhaseStatusTheme(phase.status);
              const isSelected = selectedPhaseId === phase.id;

              return (
                <div
                  key={phase.id}
                  className={`stepper-node-item ${theme.colorClass} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedPhaseId(isSelected ? null : phase.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="node-icon-wrapper">
                    {phase.status === PHASE_STATUSES.COMPLETED ? (
                      <CheckCircleIcon size={18} />
                    ) : (
                      <span className="node-idx-num">{phase.number}</span>
                    )}
                  </div>
                  <div className="node-details">
                    <span className="node-phase-title">{phase.name}</span>
                    <span className="node-phase-status" style={{ color: theme.hex }}>
                      {theme.label} ({phase.progress}%)
                    </span>
                    <span className="node-phase-dates">
                      {phase.plannedStartDate?.slice(5)} → {phase.plannedEndDate?.slice(5)}
                    </span>
                  </div>
                  {idx < phases.length - 1 && (
                    <div className={`stepper-connector-line line-${theme.colorClass}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GANTT TIMELINE VIEW */}
      <div className="gantt-timeline-container card-styled">
        <div className="gantt-header-row">
          <div>
            <h4>Gantt Execution Timeline</h4>
            <span className="text-muted">
              {sprint.startDate} to {sprint.endDate} • Vertical line indicates current day
            </span>
          </div>
          {timelineData.todayOffsetPct >= 0 && (
            <span className="today-badge-pill">
              Today: {new Date().toISOString().split('T')[0]}
            </span>
          )}
        </div>

        <div className="gantt-board-wrapper">
          {/* Today Indicator Line */}
          {timelineData.todayOffsetPct >= 0 && timelineData.todayOffsetPct <= 100 && (
            <div
              className="gantt-today-line"
              style={{ left: `calc(220px + (100% - 240px) * ${timelineData.todayOffsetPct / 100})` }}
              title="Today's Position"
            >
              <span className="today-marker-flag">Today</span>
            </div>
          )}

          {/* Phase Gantt Rows */}
          <div className="gantt-rows-list">
            {phases.map((phase) => {
              const theme = getPhaseStatusTheme(phase.status);

              // Calculate start and end offsets
              const pStart = new Date(phase.plannedStartDate).getTime();
              const pEnd = new Date(phase.plannedEndDate).getTime();
              const leftPct = Math.max(0, Math.min(100, ((pStart - timelineData.startTs) / timelineData.totalDuration) * 100));
              const rightPct = Math.max(0, Math.min(100, ((pEnd - timelineData.startTs) / timelineData.totalDuration) * 100));
              const widthPct = Math.max(3, rightPct - leftPct);

              return (
                <div
                  key={phase.id}
                  className={`gantt-row-item ${selectedPhaseId === phase.id ? 'active-row' : ''}`}
                  onClick={() => setSelectedPhaseId(phase.id)}
                >
                  <div className="gantt-row-label">
                    <span className="gantt-idx">#{phase.number}</span>
                    <strong className="gantt-name" title={phase.name}>{phase.name}</strong>
                    <span className="gantt-owner">{phase.owner}</span>
                  </div>

                  <div className="gantt-row-track">
                    <div
                      className={`gantt-bar-item bar-${theme.colorClass}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: theme.hex
                      }}
                      title={`${phase.name}: ${phase.plannedStartDate} to ${phase.plannedEndDate} (${phase.status})`}
                    >
                      <span className="gantt-bar-label">{phase.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETAILED PHASES TABLE */}
      <div className="phases-table-container card-styled">
        <div className="table-header-title">
          <h4>Phase Gates & Metadata Ledger</h4>
          <span className="text-muted">Click any row or edit button to update dates and owners</span>
        </div>

        <div className="table-responsive">
          <table className="phases-ledger-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Phase Name</th>
                <th>Status</th>
                <th>Planned Dates</th>
                <th>Actual Dates</th>
                <th>Owner</th>
                <th>Progress</th>
                <th>Related Tickets</th>
                <th>Dependency</th>
                <th>Remarks</th>
                {canManageUsers && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {phases.map((phase) => {
                const theme = getPhaseStatusTheme(phase.status);

                return (
                  <tr key={phase.id} className={selectedPhaseId === phase.id ? 'row-selected' : ''}>
                    <td><strong>{phase.number}</strong></td>
                    <td>
                      <strong>{phase.name}</strong>
                    </td>
                    <td>
                      <span
                        className="phase-status-pill"
                        style={{ backgroundColor: theme.badgeBg, color: theme.hex }}
                      >
                        {phase.status}
                      </span>
                    </td>
                    <td>
                      <span className="cell-date-span">{phase.plannedStartDate} → {phase.plannedEndDate}</span>
                    </td>
                    <td>
                      <span className="cell-date-span text-muted">
                        {phase.actualStartDate ? `${phase.actualStartDate} → ${phase.actualEndDate || 'Ongoing'}` : '—'}
                      </span>
                    </td>
                    <td>{phase.owner}</td>
                    <td>
                      <div className="cell-progress-mini">
                        <div className="progress-bar-track mini">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${phase.progress}%`, backgroundColor: theme.hex }}
                          />
                        </div>
                        <span>{phase.progress}%</span>
                      </div>
                    </td>
                    <td>{phase.relatedTicketsCount || '—'}</td>
                    <td><span className="cell-dep-badge">{phase.dependency || 'None'}</span></td>
                    <td className="cell-remarks-text">{phase.remarks || '—'}</td>
                    {canManageUsers && (
                      <td>
                        <button
                          className="table-action-edit-btn"
                          onClick={() => setEditingPhase({ ...phase })}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PHASE MODAL */}
      {editingPhase && (
        <div className="modal-backdrop-custom" onClick={() => setEditingPhase(null)}>
          <div className="modal-dialog-custom card-styled" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Edit Phase: {editingPhase.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingPhase(null)}>✕</button>
            </div>

            <form onSubmit={handleSavePhaseEdit}>
              <div className="modal-body-custom">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Phase Status</label>
                    <select
                      className="form-input-field"
                      value={editingPhase.status}
                      onChange={e => setEditingPhase({ ...editingPhase, status: e.target.value })}
                    >
                      {Object.values(PHASE_STATUSES).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                      <option value="At Risk">At Risk</option>
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label>Completion ({editingPhase.progress}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="form-input-field"
                      value={editingPhase.progress}
                      onChange={e => setEditingPhase({ ...editingPhase, progress: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Planned Start Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingPhase.plannedStartDate || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, plannedStartDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Planned End Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingPhase.plannedEndDate || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, plannedEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Actual Start Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingPhase.actualStartDate || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, actualStartDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Actual End Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingPhase.actualEndDate || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, actualEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Phase Owner</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingPhase.owner || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, owner: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Dependency</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingPhase.dependency || ''}
                      onChange={e => setEditingPhase({ ...editingPhase, dependency: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label>Remarks / Notes</label>
                  <textarea
                    rows="2"
                    className="form-input-field"
                    value={editingPhase.remarks || ''}
                    onChange={e => setEditingPhase({ ...editingPhase, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditingPhase(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Phase Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
