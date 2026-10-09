import React, { useMemo } from 'react';
import { STAGES } from '../../constants';

export function OverviewView({ tasks }) {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.stage === STAGES.COMPLETED).length;
    const active = tasks.filter(t => t.stage === STAGES.IN_PROGRESS || t.stage === STAGES.REVIEW).length;
    
    // Safely parse mandays and exclude outliers
    const velocity = Math.round(
      tasks.reduce((sum, t) => {
        const md = parseFloat(t.mandays) || 0;
        return sum + (md > 0 && md <= 200 ? md : 0);
      }, 0)
    );

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, velocity, completionRate, active };
  }, [tasks]);

  return (
    <div className="view-panel">
      <div className="overview-kpis">
        <div className="kpi-card">
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>TOTAL TASKS</div>
          <div className="kpi-num">{metrics.total}</div>
          <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Managed in SQLite DB</div>
        </div>

        <div className="kpi-card">
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>SPRINT VELOCITY</div>
          <div className="kpi-num">{metrics.velocity} MD</div>
          <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Estimated Workload</div>
        </div>

        <div className="kpi-card">
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>COMPLETION RATE</div>
          <div className="kpi-num">{metrics.completionRate}%</div>
          <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Completed Tasks</div>
        </div>

        <div className="kpi-card">
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>ACTIVE TASKS</div>
          <div className="kpi-num">{metrics.active}</div>
          <div style={{ fontSize: 12, color: '#e67d22', fontWeight: 600 }}>Under Active Development</div>
        </div>
      </div>
    </div>
  );
}

export function CalendarView() {
  return (
    <div className="view-panel">
      <div className="kpi-card">
        <h3 style={{ marginBottom: 14 }}>Sprint Milestones & Timeline</h3>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
          All release deliverables, grooming checkpoints, and UAT deployments are synced with the <strong>database.sqlite</strong> backend.
        </p>
      </div>
    </div>
  );
}
