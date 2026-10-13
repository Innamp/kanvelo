import React, { useState, useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { CalendarIcon } from '../common/Icons';

export function SprintCalendarView() {
  const { sprints, selectedSprintId, setSelectedSprintId } = useSprint();

  const [activeSprintId, setActiveSprintId] = useState(selectedSprintId || 'sprint-10');
  const [calendarMode, setCalendarMode] = useState('sprint'); // 'monthly', 'sprint', 'milestones'

  const activeSprint = useMemo(() => {
    if (activeSprintId === 'all') return sprints[sprints.length - 1];
    return sprints.find(s => s.id === activeSprintId) || sprints[0];
  }, [sprints, activeSprintId]);

  // Extract key phase deadlines from sprint phases
  const sprintDeadlines = useMemo(() => {
    const list = [];
    const sourceSprints = activeSprintId === 'all' ? sprints : [activeSprint];

    sourceSprints.forEach(s => {
      (s.phases || []).forEach(p => {
        list.push({
          sprintName: s.name,
          phaseName: p.name,
          startDate: p.plannedStartDate,
          endDate: p.plannedEndDate,
          owner: p.owner,
          status: p.status,
          progress: p.progress
        });
      });
    });

    return list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [activeSprintId, activeSprint, sprints]);

  return (
    <div className="sprint-calendar-page animate-fade-in">
      {/* Top Header & Filters */}
      <div className="calendar-header-card card-styled">
        <div className="calendar-title-wrap">
          <div className="calendar-icon-box">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2>Sprint Deadlines & Milestone Calendar</h2>
            <p className="text-muted">
              Key phase gates, BRD/PRD submission, IT assessment, dev windows, UAT, and production releases
            </p>
          </div>
        </div>

        <div className="calendar-actions-wrap">
          {/* Sprint Selector */}
          <select
            value={activeSprintId}
            onChange={e => setActiveSprintId(e.target.value)}
            className="filter-select-input"
          >
            <option value="all">All Sprints (1 to 10)</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>

          {/* Mode Switcher */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${calendarMode === 'sprint' ? 'active' : ''}`}
              onClick={() => setCalendarMode('sprint')}
            >
              Sprint Calendar
            </button>
            <button
              className={`view-mode-btn ${calendarMode === 'milestones' ? 'active' : ''}`}
              onClick={() => setCalendarMode('milestones')}
            >
              Milestone Timeline
            </button>
            <button
              className={`view-mode-btn ${calendarMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setCalendarMode('monthly')}
            >
              Monthly View
            </button>
          </div>
        </div>
      </div>

      {/* SPRINT CALENDAR MODE */}
      {calendarMode === 'sprint' && (
        <div className="calendar-content-stack card-styled">
          <div className="calendar-subhead">
            <h4>{activeSprintId === 'all' ? 'All Sprint Phases' : `${activeSprint.name} Phase Deadlines & Dates`}</h4>
            <span className="text-muted">{activeSprint.startDate} to {activeSprint.endDate}</span>
          </div>

          <div className="sprint-milestone-cards-grid">
            {sprintDeadlines.map((item, idx) => (
              <div key={idx} className="deadline-milestone-card card-styled">
                <div className="deadline-top-line">
                  <span className="deadline-sprint-tag">{item.sprintName}</span>
                  <span className={`cell-phase-chip status-${(item.status || 'not started').toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </div>

                <strong className="deadline-phase-title">{item.phaseName}</strong>

                <div className="deadline-dates-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{item.startDate} → {item.endDate}</span>
                </div>

                <div className="deadline-meta-row">
                  <span className="text-muted text-xs">Owner: {item.owner}</span>
                  <span className="text-xs font-semibold">{item.progress}% Complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MILESTONE TIMELINE MODE */}
      {calendarMode === 'milestones' && (
        <div className="calendar-content-stack card-styled">
          <div className="calendar-subhead">
            <h4>Sequential Gate Milestones</h4>
            <span className="text-muted">Chronological order of delivery gates</span>
          </div>

          <div className="milestone-timeline-track">
            {sprintDeadlines.map((item, idx) => (
              <div key={idx} className="milestone-track-step">
                <div className="track-marker-col">
                  <span className="marker-bubble">{idx + 1}</span>
                  {idx < sprintDeadlines.length - 1 && <span className="marker-stem" />}
                </div>

                <div className="track-content-card card-styled">
                  <div className="track-card-head">
                    <span className="track-sprint-badge">{item.sprintName}</span>
                    <span className="track-date-text">{item.startDate} → {item.endDate}</span>
                  </div>
                  <strong className="track-title">{item.phaseName}</strong>
                  <p className="track-owner-text">Owner: {item.owner} • Status: {item.status} ({item.progress}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTHLY CALENDAR MODE */}
      {calendarMode === 'monthly' && (
        <div className="calendar-content-stack card-styled">
          <div className="calendar-subhead">
            <h4>Monthly View & Key Delivery Dates</h4>
            <span className="text-muted">High-level distribution</span>
          </div>

          <div className="monthly-calendar-grid">
            {sprintDeadlines.slice(0, 15).map((item, idx) => (
              <div key={idx} className="monthly-day-block card-styled">
                <div className="day-date-number">{item.startDate?.slice(5)}</div>
                <strong className="day-event-name">{item.phaseName}</strong>
                <span className="day-event-sprint">{item.sprintName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
