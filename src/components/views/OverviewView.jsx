import React, { useMemo } from 'react';
import { STAGES, PRIORITIES } from '../../constants';
import { PriorityBadge } from '../common/PriorityBadge';
import { Avatar } from '../common/Avatar';

export function OverviewView({ tasks, onTaskClick }) {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.stage === STAGES.COMPLETED).length;
    const inProgress = tasks.filter(t => t.stage === STAGES.IN_PROGRESS).length;
    const inReview = tasks.filter(t => t.stage === STAGES.REVIEW).length;
    const todo = tasks.filter(t => !t.stage || t.stage === STAGES.TODO).length;
    const active = inProgress + inReview;

    // Safely parse mandays
    let totalVelocity = 0;
    let completedVelocity = 0;

    tasks.forEach(t => {
      const md = parseFloat(t.mandays) || 0;
      if (md > 0 && md <= 200) {
        totalVelocity += md;
        if (t.stage === STAGES.COMPLETED) {
          completedVelocity += md;
        }
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const velocityRate = totalVelocity > 0 ? Math.round((completedVelocity / totalVelocity) * 100) : 0;

    // Priority counts
    const highPriority = tasks.filter(t => t.priority === PRIORITIES.HIGH).length;
    const medPriority = tasks.filter(t => t.priority === PRIORITIES.MEDIUM).length;
    const lowPriority = tasks.filter(t => t.priority === PRIORITIES.LOW).length;

    // Platform breakdown
    const platformMap = {};
    tasks.forEach(t => {
      const p = t.platform || 'General';
      if (!platformMap[p]) {
        platformMap[p] = { name: p, total: 0, completed: 0, inProgress: 0, mandays: 0 };
      }
      platformMap[p].total += 1;
      const md = parseFloat(t.mandays) || 0;
      if (md > 0 && md <= 200) platformMap[p].mandays += md;
      if (t.stage === STAGES.COMPLETED) platformMap[p].completed += 1;
      if (t.stage === STAGES.IN_PROGRESS || t.stage === STAGES.REVIEW) platformMap[p].inProgress += 1;
    });

    const platforms = Object.values(platformMap)
      .map(p => ({
        ...p,
        mandays: Math.round(p.mandays),
        percent: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    // High priority active tasks needing attention
    const urgentTasks = tasks
      .filter(t => t.priority === PRIORITIES.HIGH && t.stage !== STAGES.COMPLETED)
      .slice(0, 6);

    return {
      total,
      completed,
      inProgress,
      inReview,
      todo,
      active,
      totalVelocity: Math.round(totalVelocity),
      completedVelocity: Math.round(completedVelocity),
      remainingVelocity: Math.max(0, Math.round(totalVelocity - completedVelocity)),
      completionRate,
      velocityRate,
      highPriority,
      medPriority,
      lowPriority,
      platforms,
      urgentTasks
    };
  }, [tasks]);

  return (
    <div className="view-panel overview-dashboard-panel">
      {/* 1. Top KPI Metric Cards */}
      <div className="overview-kpis">
        <div className="kpi-card">
          <div className="kpi-header-row">
            <span className="kpi-tag-label">TOTAL WORKLOAD</span>
            <span className="kpi-badge-pill teal">SQLite Synced</span>
          </div>
          <div className="kpi-num">{metrics.total}</div>
          <div className="kpi-subtext">
            <span><strong>{metrics.completed}</strong> done</span>
            <span className="kpi-dot-sep">•</span>
            <span><strong>{metrics.active}</strong> in flight</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header-row">
            <span className="kpi-tag-label">SPRINT VELOCITY</span>
            <span className="kpi-badge-pill yellow">{metrics.totalVelocity} MD</span>
          </div>
          <div className="kpi-num">{metrics.totalVelocity} <span className="kpi-unit">MD</span></div>
          <div className="kpi-subtext">
            <span><strong>{metrics.completedVelocity} MD</strong> delivered</span>
            <span className="kpi-dot-sep">•</span>
            <span>{metrics.remainingVelocity} MD left</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header-row">
            <span className="kpi-tag-label">COMPLETION RATE</span>
            <span className="kpi-badge-pill teal">{metrics.completionRate}%</span>
          </div>
          <div className="kpi-num">{metrics.completionRate}%</div>
          <div className="kpi-progress-bar-wrap">
            <div className="kpi-progress-fill" style={{ width: `${metrics.completionRate}%` }} />
          </div>
          <div className="kpi-subtext">
            <span>Target: 100% by Sprint Close</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header-row">
            <span className="kpi-tag-label">ACTIVE SPRINT ITEMS</span>
            <span className="kpi-badge-pill orange">{metrics.active} Active</span>
          </div>
          <div className="kpi-num">{metrics.active}</div>
          <div className="kpi-subtext">
            <span><strong>{metrics.inProgress}</strong> coding</span>
            <span className="kpi-dot-sep">•</span>
            <span><strong>{metrics.inReview}</strong> under review</span>
          </div>
        </div>
      </div>

      {/* 2. Sprint Workflow Pipeline Flow */}
      <div className="overview-section-card pipeline-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Sprint Pipeline Distribution</h3>
            <p className="section-card-desc">Visual balance of sprint backlog moving across development stages</p>
          </div>
          <div className="pipeline-legend">
            <span className="legend-item"><span className="legend-dot todo" /> To Do ({metrics.todo})</span>
            <span className="legend-item"><span className="legend-dot progress" /> In Progress ({metrics.inProgress})</span>
            <span className="legend-item"><span className="legend-dot review" /> In Review ({metrics.inReview})</span>
            <span className="legend-item"><span className="legend-dot completed" /> Completed ({metrics.completed})</span>
          </div>
        </div>

        {metrics.total > 0 && (
          <div className="pipeline-track">
            <div
              className="pipeline-seg todo"
              style={{ width: `${(metrics.todo / metrics.total) * 100}%` }}
              title={`To Do: ${metrics.todo}`}
            />
            <div
              className="pipeline-seg progress"
              style={{ width: `${(metrics.inProgress / metrics.total) * 100}%` }}
              title={`In Progress: ${metrics.inProgress}`}
            />
            <div
              className="pipeline-seg review"
              style={{ width: `${(metrics.inReview / metrics.total) * 100}%` }}
              title={`In Review: ${metrics.inReview}`}
            />
            <div
              className="pipeline-seg completed"
              style={{ width: `${(metrics.completed / metrics.total) * 100}%` }}
              title={`Completed: ${metrics.completed}`}
            />
          </div>
        )}

        <div className="pipeline-stat-pills">
          <div className="pipeline-pill">
            <span className="pill-dot todo" />
            <span className="pill-name">Backlog / To Do</span>
            <span className="pill-val">{metrics.todo} tasks ({metrics.total > 0 ? Math.round((metrics.todo / metrics.total) * 100) : 0}%)</span>
          </div>
          <div className="pipeline-pill">
            <span className="pill-dot progress" />
            <span className="pill-name">In Progress</span>
            <span className="pill-val">{metrics.inProgress} tasks ({metrics.total > 0 ? Math.round((metrics.inProgress / metrics.total) * 100) : 0}%)</span>
          </div>
          <div className="pipeline-pill">
            <span className="pill-dot review" />
            <span className="pill-name">Code Review</span>
            <span className="pill-val">{metrics.inReview} tasks ({metrics.total > 0 ? Math.round((metrics.inReview / metrics.total) * 100) : 0}%)</span>
          </div>
          <div className="pipeline-pill">
            <span className="pill-dot completed" />
            <span className="pill-name">Delivered</span>
            <span className="pill-val">{metrics.completed} tasks ({metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Analytical Breakdown */}
      <div className="overview-analytics-grid">
        {/* Left: Platform Workload Allocation */}
        <div className="overview-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Platform & Module Breakdown</h3>
              <p className="section-card-desc">Workload distribution and delivery progress by target application</p>
            </div>
            <span className="section-badge-counter">{metrics.platforms.length} Platforms</span>
          </div>

          <div className="platform-list">
            {metrics.platforms.slice(0, 6).map((platform, index) => (
              <div key={platform.name} className="platform-row">
                <div className="platform-row-top">
                  <div className="platform-identity">
                    <span className="platform-avatar-badge" data-index={index}>
                      {platform.name.substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="platform-name">{platform.name}</div>
                      <div className="platform-sub">
                        {platform.completed} of {platform.total} tasks completed • {platform.mandays} MD
                      </div>
                    </div>
                  </div>
                  <div className="platform-percent-tag">{platform.percent}%</div>
                </div>
                <div className="platform-progress-track">
                  <div
                    className="platform-progress-fill"
                    style={{ width: `${platform.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent & High Priority Focus */}
        <div className="overview-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">High Priority Backlog Focus</h3>
              <p className="section-card-desc">Active critical items requiring immediate developer or QA attention</p>
            </div>
            <span className="section-badge-counter alert">{metrics.urgentTasks.length} Urgent</span>
          </div>

          {metrics.urgentTasks.length === 0 ? (
            <div className="empty-focus-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#178a70" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h4>No critical blockers</h4>
              <p>All high-priority tasks are either resolved or in good standing.</p>
            </div>
          ) : (
            <div className="urgent-task-list">
              {metrics.urgentTasks.map(task => (
                <div
                  key={task.id}
                  className="urgent-task-item"
                  onClick={() => onTaskClick && onTaskClick(task)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="urgent-task-left">
                    <PriorityBadge priority={task.priority} />
                    <div className="urgent-task-info">
                      <div className="urgent-task-title">{task.title}</div>
                      <div className="urgent-task-meta">
                        <span className="urgent-meta-tag">{task.platform || 'General'}</span>
                        <span className="urgent-meta-dot">•</span>
                        <span>{task.mandays || 5} MD</span>
                        <span className="urgent-meta-dot">•</span>
                        <span className="stage-pill-text">{(task.stage || 'todo').replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="urgent-task-right">
                    <Avatar name={task.assignee || 'Unassigned'} size={28} />
                    <button className="btn-urgent-open" aria-label="Open task">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Sprint Health & Tech Stack Banner */}
      <div className="overview-health-bar">
        <div className="health-stat">
          <span className="health-indicator-pulse" />
          <div className="health-stat-text">
            <strong>SQLite Database Online</strong>
            <span>496 tasks indexed with instant PDO CRUD</span>
          </div>
        </div>
        <div className="health-stat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <div className="health-stat-text">
            <strong>Target Delivery</strong>
            <span>Sprint 10: May 20 – June 30, 2025</span>
          </div>
        </div>
        <div className="health-stat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div className="health-stat-text">
            <strong>Resource Allocation</strong>
            <span>6 Core Engineers Assigned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarView() {
  return (
    <div className="view-panel">
      <div className="overview-section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Sprint Timeline & Milestones</h3>
            <p className="section-card-desc">Scheduled deployments, sprint grooming checkpoints, and UAT dates</p>
          </div>
        </div>
        <div className="calendar-placeholder-grid">
          <div className="timeline-item">
            <div className="timeline-date">May 20, 2025</div>
            <div className="timeline-content">
              <strong>Sprint 10 Kickoff</strong>
              <p>Grooming and task allocation across AYO Toko, CITA, and DTE teams.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">June 05, 2025</div>
            <div className="timeline-content">
              <strong>Mid-Sprint Architecture Review</strong>
              <p>Cross-team synchronization, API contracts review, and blocker resolution.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">June 20, 2025</div>
            <div className="timeline-content">
              <strong>Staging & UAT Deployment</strong>
              <p>Feature freeze and release candidate testing with product stakeholders.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">June 30, 2025</div>
            <div className="timeline-content">
              <strong>Production Release & Retrospective</strong>
              <p>Production deployment rollout and sprint closure retrospective.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentsView() {
  return (
    <div className="view-panel">
      <div className="overview-section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Project Documentation & Architecture</h3>
            <p className="section-card-desc">Sprint artifacts, engineering specifications, and API documentation</p>
          </div>
        </div>
        <div className="docs-grid">
          <div className="doc-item-card">
            <div className="doc-icon">📄</div>
            <div className="doc-details">
              <strong>Sprint 10 Product Specification</strong>
              <span>Updated 2 days ago • PDF (2.4 MB)</span>
            </div>
          </div>
          <div className="doc-item-card">
            <div className="doc-icon">🗄️</div>
            <div className="doc-details">
              <strong>SQLite Database Schema Reference</strong>
              <span>Tables: tasks, assignees, sprints • SQL/PDO</span>
            </div>
          </div>
          <div className="doc-item-card">
            <div className="doc-icon">🔌</div>
            <div className="doc-details">
              <strong>REST API Endpoints Guide</strong>
              <span>GET/POST/PUT/DELETE /api.php • JSON format</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessagesView() {
  return (
    <div className="view-panel">
      <div className="overview-section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Team Messages & Standup Logs</h3>
            <p className="section-card-desc">Synchronized discussions, blockers, and sprint daily updates</p>
          </div>
        </div>
        <div className="messages-list-preview">
          <div className="msg-preview-item">
            <Avatar name="Sarah Jenkins" size={32} />
            <div className="msg-preview-content">
              <div className="msg-preview-head">
                <strong>Sarah Jenkins</strong> <span>Today at 10:14 AM</span>
              </div>
              <p>SQLite migration completed! All 496 backlog tasks are now running on local database.sqlite with instant reactivity.</p>
            </div>
          </div>
          <div className="msg-preview-item">
            <Avatar name="Alex Rivera" size={32} />
            <div className="msg-preview-content">
              <div className="msg-preview-head">
                <strong>Alex Rivera</strong> <span>Yesterday at 4:32 PM</span>
              </div>
              <p>PR #42 merged: Full-width responsive layout applied with real-time Kanban drag-and-drop.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
