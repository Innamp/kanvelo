import React, { useState, useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { GitBranchIcon } from '../common/Icons';

export function TimelineView({ onSelectSprint }) {
  const { sprints, openSprintDetail } = useSprint();
  const [filterYear, setFilterYear] = useState('all');

  // Filter sprints
  const filteredSprints = useMemo(() => {
    if (filterYear === 'all') return sprints;
    return sprints.filter(s => s.year?.toString() === filterYear);
  }, [sprints, filterYear]);

  // Overall date span
  const bounds = useMemo(() => {
    if (!sprints.length) return { start: new Date(), end: new Date(), duration: 1 };
    const firstDate = new Date(sprints[0].startDate);
    const lastDate = new Date(sprints[sprints.length - 1].endDate);
    return {
      start: firstDate,
      end: lastDate,
      duration: Math.max(1, lastDate.getTime() - firstDate.getTime())
    };
  }, [sprints]);

  const now = new Date();
  const todayPct = Math.max(0, Math.min(100, ((now.getTime() - bounds.start.getTime()) / bounds.duration) * 100));

  return (
    <div className="timeline-page-container animate-fade-in">
      {/* Header */}
      <div className="timeline-header-card card-styled">
        <div className="timeline-title-wrap">
          <div className="timeline-icon-box">
            <GitBranchIcon size={24} />
          </div>
          <div>
            <h2>Master Sprint Timeline & Roadmap</h2>
            <p className="text-muted">
              Chronological schedule and milestones across Sprint 1 to Sprint 10
            </p>
          </div>
        </div>

        <div className="timeline-controls-wrap">
          <span className="today-badge-pill">
            Today: {now.toISOString().split('T')[0]}
          </span>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="filter-select-input"
          >
            <option value="all">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Cross-Sprint Timeline Board */}
      <div className="timeline-board-card card-styled">
        <div className="timeline-card-header">
          <div>
            <h4>Horizontal Sprint Roadmap (S1 to S10)</h4>
            <span className="text-muted text-xs">Chronological timeline tracking duration and active phase</span>
          </div>
          <span className="badge-trail-count">{filteredSprints.length} Sprints</span>
        </div>
        <div className="timeline-canvas-container">
          {/* Vertical Today Line */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              className="timeline-today-marker"
              style={{ left: `calc(180px + (100% - 200px) * ${todayPct / 100})` }}
            >
              <span className="marker-tag">Current Date</span>
            </div>
          )}

          {/* Sprints Track */}
          <div className="timeline-sprint-rows">
            {filteredSprints.map(s => {
              const sStart = new Date(s.startDate).getTime();
              const sEnd = new Date(s.endDate).getTime();
              const leftPct = Math.max(0, Math.min(100, ((sStart - bounds.start.getTime()) / bounds.duration) * 100));
              const rightPct = Math.max(0, Math.min(100, ((sEnd - bounds.start.getTime()) / bounds.duration) * 100));
              const widthPct = Math.max(4, rightPct - leftPct);

              return (
                <div
                  key={s.id}
                  className="timeline-sprint-row"
                  onClick={() => {
                    openSprintDetail(s.id);
                    if (onSelectSprint) onSelectSprint(s.id);
                  }}
                >
                  <div className="sprint-row-meta">
                    <strong>{s.name}</strong>
                    <span className="text-muted text-xs">{s.status}</span>
                  </div>

                  <div className="sprint-bar-track">
                    <div
                      className={`timeline-sprint-bar status-${s.status.toLowerCase()}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`
                      }}
                      title={`${s.name} (${s.startDate} to ${s.endDate})`}
                    >
                      <span className="bar-title">{s.name} • {s.currentPhase}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Milestones Schedule */}
      <div className="timeline-milestones-grid">
        {filteredSprints.map(s => (
          <div
            key={s.id}
            className="milestone-sprint-box card-styled cursor-pointer"
            onClick={() => {
              openSprintDetail(s.id);
              if (onSelectSprint) onSelectSprint(s.id);
            }}
          >
            <div className="milestone-head">
              <strong>{s.name}</strong>
              <span className={`sprint-status-pill status-${s.status.toLowerCase()}`}>{s.status}</span>
            </div>
            <span className="milestone-dates">{s.startDate} → {s.endDate}</span>
            <div className="milestone-phase-badge">Current: {s.currentPhase}</div>
            <p className="milestone-goal-text">{s.goal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
