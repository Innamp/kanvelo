import React, { useMemo } from 'react';
import { CheckCircleIcon, AlertTriangleIcon } from '../../common/Icons';

export function DeploymentTab({ sprint, tasks, metrics }) {
  // Categorize deployment status
  const deployedTickets = useMemo(() => {
    return tasks.filter(t => {
      const st = (t.lifecycle_stage || t.ticket_status || t.stage || '').toLowerCase();
      return st.includes('deploy') && !st.includes('ready');
    });
  }, [tasks]);

  const readyToDeployTickets = useMemo(() => {
    return tasks.filter(t => {
      const st = (t.lifecycle_stage || t.ticket_status || t.stage || '').toLowerCase();
      return st.includes('ready to deploy') || st.includes('ready-deploy') || t.deployment_readiness === 'Ready to Deploy';
    });
  }, [tasks]);

  const inTestingTickets = useMemo(() => {
    return tasks.filter(t => {
      const st = (t.lifecycle_stage || t.ticket_status || t.stage || '').toLowerCase();
      return st.includes('uat') || st.includes('review');
    });
  }, [tasks]);

  return (
    <div className="deployment-tab animate-fade-in">
      {/* Top Deployment Summary Strip */}
      <div className="deployment-summary-card card-styled">
        <div className="summary-left">
          <div className="deploy-icon-badge">🚀</div>
          <div>
            <h3>Production Release & Deployment Gate</h3>
            <p className="text-muted">
              Sprint Target Deployment Date: <strong>{sprint.endDate}</strong> • Release Lead: {sprint.owner || 'DevOps Team'}
            </p>
          </div>
        </div>

        <div className="deploy-status-counters">
          <div className="deploy-counter-box text-success">
            <span className="count-num">{deployedTickets.length}</span>
            <span className="count-label">Deployed</span>
          </div>
          <div className="deploy-counter-box text-teal">
            <span className="count-num">{readyToDeployTickets.length}</span>
            <span className="count-label">Ready to Deploy</span>
          </div>
          <div className="deploy-counter-box text-warning">
            <span className="count-num">{inTestingTickets.length}</span>
            <span className="count-label">In UAT / Review</span>
          </div>
        </div>
      </div>

      {/* Deployment Readiness Checklist */}
      <div className="deployment-checklist-card card-styled">
        <div className="checklist-header">
          <h4>Deployment Readiness Criteria & Gates</h4>
          <span className="badge-gate-pass">Release Gate Active</span>
        </div>

        <div className="checklist-grid">
          <div className="checklist-item is-checked">
            <CheckCircleIcon size={18} className="text-success" />
            <div>
              <strong>UAT Sign-off Completed</strong>
              <p>Commercial stakeholders have verified test cases</p>
            </div>
          </div>
          <div className="checklist-item is-checked">
            <CheckCircleIcon size={18} className="text-success" />
            <div>
              <strong>Code Review & PR Approval</strong>
              <p>Clean CI passes with zero critical lint/security failures</p>
            </div>
          </div>
          <div className="checklist-item">
            <AlertTriangleIcon size={18} className="text-warning" />
            <div>
              <strong>Rollback & Migration Plan</strong>
              <p>Database migration scripts tested on staging</p>
            </div>
          </div>
          <div className="checklist-item">
            <CheckCircleIcon size={18} className="text-teal" />
            <div>
              <strong>Release Note Drafted</strong>
              <p>Version release note prepared for business users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Deploy Section */}
      <div className="deploy-section-card card-styled">
        <div className="section-head-row">
          <h4>📦 Ready to Deploy Tickets ({readyToDeployTickets.length})</h4>
          <span className="text-muted">Tickets that have passed UAT and are awaiting pipeline execution</span>
        </div>

        {readyToDeployTickets.length === 0 ? (
          <p className="no-tickets-text">No tickets currently waiting in 'Ready to Deploy' state.</p>
        ) : (
          <div className="table-responsive">
            <table className="deploy-tickets-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title / Epic</th>
                  <th>Platform</th>
                  <th>PM</th>
                  <th>Assignee</th>
                  <th>Target Date</th>
                  <th>UAT Status</th>
                </tr>
              </thead>
              <tbody>
                {readyToDeployTickets.map(t => (
                  <tr key={t.id}>
                    <td><span className="code-chip">{t.ticket_code || t.code || 'S-TKT'}</span></td>
                    <td><strong>{t.title}</strong></td>
                    <td><span className="platform-tag-pill">{t.platforms || t.platform || 'General'}</span></td>
                    <td>{t.product_managers || t.product_manager || 'PMO'}</td>
                    <td>{t.assignees || t.assignee || 'Unassigned'}</td>
                    <td>{t.expected_deployment_date || sprint.endDate}</td>
                    <td><span className="uat-chip font-semibold text-success">Passed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Already Deployed Section */}
      <div className="deploy-section-card card-styled">
        <div className="section-head-row">
          <h4>🚀 Deployed Tickets ({deployedTickets.length})</h4>
          <span className="text-muted">Tickets deployed to production environment for this sprint</span>
        </div>

        {deployedTickets.length === 0 ? (
          <p className="no-tickets-text">No tickets deployed yet in this sprint.</p>
        ) : (
          <div className="table-responsive">
            <table className="deploy-tickets-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title / Epic</th>
                  <th>Platform</th>
                  <th>PM</th>
                  <th>Assignee</th>
                  <th>Mandays</th>
                  <th>Deployment Status</th>
                </tr>
              </thead>
              <tbody>
                {deployedTickets.map(t => (
                  <tr key={t.id}>
                    <td><span className="code-chip">{t.ticket_code || t.code || 'S-TKT'}</span></td>
                    <td><strong>{t.title}</strong></td>
                    <td><span className="platform-tag-pill">{t.platforms || t.platform || 'General'}</span></td>
                    <td>{t.product_managers || t.product_manager || 'PMO'}</td>
                    <td>{t.assignees || t.assignee || 'Unassigned'}</td>
                    <td>{t.mandays || 1} MD</td>
                    <td><span className="status-counter-pill state-deployed">Live in Prod</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
