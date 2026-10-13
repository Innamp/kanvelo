import React, { useState, useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { useAuth } from '../../context/AuthContext';
import { SPRINT_STATUSES, SPRINT_HEALTH } from '../../constants/sprintConstants';
import { OverviewTab } from './tabs/OverviewTab';
import { PhasesTimelineTab } from './tabs/PhasesTimelineTab';
import { SprintTicketsTab } from './tabs/SprintTicketsTab';
import { SprintKanbanTab } from './tabs/SprintKanbanTab';
import { CapacityMandaysTab } from './tabs/CapacityMandaysTab';
import { DeploymentTab } from './tabs/DeploymentTab';
import { SprintHistoryTab } from './tabs/SprintHistoryTab';

export function SprintDetailView({ sprintId, onBack, onTaskClick }) {
  const { sprints, getTasksForSprint, getSprintMetrics, openSprintDetail, lockSprint, completeSprint } = useSprint();
  const { canManageUsers } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');

  // Find active sprint
  const sprint = useMemo(() => {
    return sprints.find(s => s.id === sprintId) || sprints[sprints.length - 1];
  }, [sprints, sprintId]);

  // Tasks and calculated metrics for this sprint only
  const tasks = useMemo(() => {
    return getTasksForSprint(sprint.id);
  }, [sprint.id, getTasksForSprint]);

  const metrics = useMemo(() => {
    return getSprintMetrics(sprint.id);
  }, [sprint.id, getSprintMetrics]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'phases', label: 'Phases & Timeline', icon: '⏱️' },
    { id: 'tickets', label: `Tickets (${tasks.length})`, icon: '🎫' },
    { id: 'kanban', label: 'Kanban', icon: '📌' },
    { id: 'capacity', label: 'Capacity & Mandays', icon: '📊' },
    { id: 'deployment', label: 'Deployment', icon: '🚀' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  const statusClass = `status-${sprint.status.toLowerCase()}`;
  const healthClass = `health-${(sprint.health || 'on track').toLowerCase().replace(' ', '-')}`;

  return (
    <div className="sprint-detail-view animate-fade-in">
      {/* Top Banner Navigation & Quick Sprint Switcher */}
      <div className="sprint-detail-top-nav card-styled">
        <div className="nav-left-group">
          <button className="back-btn-pill" onClick={onBack} title="Back to Sprint List">
            ← Sprints
          </button>

          <div className="sprint-selector-dropdown-wrap">
            <span className="sprint-id-label">Active Sprint:</span>
            <select
              value={sprint.id}
              onChange={e => openSprintDetail(e.target.value)}
              className="sprint-jump-select"
            >
              {sprints.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="sprint-badges-wrap">
            <span className={`sprint-status-pill ${statusClass}`}>{sprint.status}</span>
            <span className={`sprint-health-pill ${healthClass}`}>Health: {sprint.health || 'On Track'}</span>
            <span className="sprint-dates-chip">
              {sprint.startDate} → {sprint.endDate}
            </span>
          </div>
        </div>

        {/* Admin Actions: Lock, Complete */}
        {canManageUsers && (
          <div className="nav-right-actions">
            {sprint.status !== SPRINT_STATUSES.LOCKED && (
              <button
                className="btn-secondary btn-sm"
                onClick={() => lockSprint(sprint.id)}
                title="Lock sprint scope from modifications"
              >
                🔒 Lock Sprint
              </button>
            )}
            {sprint.status !== SPRINT_STATUSES.COMPLETED && (
              <button
                className="btn-primary btn-sm"
                onClick={() => completeSprint(sprint.id)}
                title="Mark sprint as officially completed"
              >
                ✓ Complete Sprint
              </button>
            )}
          </div>
        )}
      </div>

      {/* 7 Tab Bar */}
      <div className="sprint-tab-bar card-styled">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sprint-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Content Pane */}
      <div className="sprint-tab-pane-content">
        {activeTab === 'overview' && (
          <OverviewTab
            sprint={sprint}
            metrics={metrics}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === 'phases' && (
          <PhasesTimelineTab
            sprint={sprint}
          />
        )}

        {activeTab === 'tickets' && (
          <SprintTicketsTab
            sprint={sprint}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        )}

        {activeTab === 'kanban' && (
          <SprintKanbanTab
            sprint={sprint}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        )}

        {activeTab === 'capacity' && (
          <CapacityMandaysTab
            sprint={sprint}
            metrics={metrics}
            tasks={tasks}
          />
        )}

        {activeTab === 'deployment' && (
          <DeploymentTab
            sprint={sprint}
            tasks={tasks}
            metrics={metrics}
          />
        )}

        {activeTab === 'history' && (
          <SprintHistoryTab
            sprint={sprint}
            tasks={tasks}
          />
        )}
      </div>
    </div>
  );
}
