import React, { useState } from 'react';
import { useSprint } from '../../context/SprintContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SPRINT_STATUSES, SPRINT_HEALTH, SPRINT_PHASE_NAMES, PHASE_STATUSES } from '../../constants/sprintConstants';
import { SlidersIcon, AlertTriangleIcon, CheckCircleIcon } from '../common/Icons';

export function SprintConfigView() {
  const { sprints, updateSprint, createSprint, lockSprint, completeSprint } = useSprint();
  const { canManageUsers } = useAuth();
  const { showToast } = useToast();

  const [selectedSprintId, setSelectedSprintId] = useState(sprints[sprints.length - 1]?.id || 'sprint-10');
  const [editingSprint, setEditingSprint] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Sprint form state
  const [newSprintData, setNewSprintData] = useState({
    name: `Sprint ${sprints.length + 1}`,
    number: sprints.length + 1,
    year: 2025,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    capacity: 180,
    goal: 'Deliver prioritized backlog items.',
    owner: 'Inna MP'
  });

  const activeSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];

  const handleStartEdit = (s) => {
    if (!canManageUsers) {
      showToast('Only Administrator and Deployment / CI team can edit sprint configuration.');
      return;
    }
    setEditingSprint({ ...s });
  };

  const handleSaveSprint = (e) => {
    e.preventDefault();
    if (!editingSprint) return;
    updateSprint(editingSprint.id, editingSprint);
    setEditingSprint(null);
    showToast(`${editingSprint.name} configuration saved successfully`);
  };

  const handleCreateNewSprint = (e) => {
    e.preventDefault();
    if (!canManageUsers) {
      showToast('Only Administrator can create sprints.');
      return;
    }
    createSprint(newSprintData);
    setIsCreatingNew(false);
    showToast(`Created ${newSprintData.name} successfully`);
  };

  return (
    <div className="sprint-config-page animate-fade-in">
      {/* Header */}
      <div className="config-header-card card-styled">
        <div className="config-title-wrap">
          <div className="config-icon-box">
            <SlidersIcon size={24} />
          </div>
          <div>
            <h2>Sprint Administration & Configuration</h2>
            <p className="text-muted">
              Configure Sprint 1 to Sprint 10 master parameters, timelines, capacities, phases, and gates
            </p>
          </div>
        </div>

        <div className="config-actions-wrap">
          {!canManageUsers ? (
            <span className="read-only-badge">
              🔒 Read-Only Access (Administrator permissions required to edit)
            </span>
          ) : (
            <button className="btn-primary btn-sm" onClick={() => setIsCreatingNew(true)}>
              + Create New Sprint
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Sprint List on Left, Detail Editor on Right */}
      <div className="config-layout-grid">
        {/* Left Column: Sprints Selector & Status List */}
        <div className="config-sprints-sidebar card-styled">
          <div className="sidebar-head">
            <h4>Sprint Master Records</h4>
            <span className="text-muted text-xs">{sprints.length} Total Sprints</span>
          </div>

          <div className="sprints-selector-list">
            {sprints.map(s => {
              const isSelected = s.id === selectedSprintId;

              return (
                <div
                  key={s.id}
                  className={`sprint-select-row ${isSelected ? 'active-sprint-row' : ''}`}
                  onClick={() => setSelectedSprintId(s.id)}
                >
                  <div className="row-info">
                    <strong>{s.name}</strong>
                    <span className="text-muted text-xs">{s.year} • {s.capacity} MD</span>
                  </div>
                  <span className={`sprint-status-pill status-${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Sprint Configuration Panel */}
        <div className="config-main-panel card-styled">
          {activeSprint && (
            <div>
              <div className="panel-top-row">
                <div>
                  <h3>Configuration: {activeSprint.name}</h3>
                  <span className="text-muted text-xs">
                    {activeSprint.startDate} to {activeSprint.endDate} • Health: {activeSprint.health || 'On Track'}
                  </span>
                </div>

                {canManageUsers && (
                  <div className="panel-actions">
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleStartEdit(activeSprint)}
                    >
                      ✏️ Edit Sprint Parameters
                    </button>
                    {activeSprint.status !== SPRINT_STATUSES.LOCKED && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          lockSprint(activeSprint.id);
                          showToast(`${activeSprint.name} locked`);
                        }}
                      >
                        🔒 Lock
                      </button>
                    )}
                    {activeSprint.status !== SPRINT_STATUSES.COMPLETED && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => {
                          completeSprint(activeSprint.id);
                          showToast(`${activeSprint.name} marked completed`);
                        }}
                      >
                        ✓ Complete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sprint Core Settings Display */}
              <div className="config-details-grid">
                <div className="cfg-field-box">
                  <span className="cfg-label">Sprint Number</span>
                  <strong className="cfg-val">#{activeSprint.number}</strong>
                </div>
                <div className="cfg-field-box">
                  <span className="cfg-label">Sprint Year</span>
                  <strong className="cfg-val">{activeSprint.year}</strong>
                </div>
                <div className="cfg-field-box">
                  <span className="cfg-label">Capacity Commitment</span>
                  <strong className="cfg-val">{activeSprint.capacity} Mandays</strong>
                </div>
                <div className="cfg-field-box">
                  <span className="cfg-label">Current Phase</span>
                  <strong className="cfg-val">{activeSprint.currentPhase}</strong>
                </div>
                <div className="cfg-field-box">
                  <span className="cfg-label">Start Date</span>
                  <strong className="cfg-val">{activeSprint.startDate}</strong>
                </div>
                <div className="cfg-field-box">
                  <span className="cfg-label">End Date</span>
                  <strong className="cfg-val">{activeSprint.endDate}</strong>
                </div>
                <div className="cfg-field-box full-span">
                  <span className="cfg-label">Sprint Objective / Goal</span>
                  <p className="cfg-prose">{activeSprint.goal}</p>
                </div>
                <div className="cfg-field-box full-span">
                  <span className="cfg-label">Sprint Owner</span>
                  <strong className="cfg-val">{activeSprint.owner || 'Inna MP'}</strong>
                </div>
              </div>

              {/* 11 Phase Dates Ledger */}
              <div className="cfg-phases-section">
                <h4>Configured Phase Gates ({activeSprint.phases?.length || 0})</h4>
                <div className="table-responsive">
                  <table className="cfg-phases-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Phase Name</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Planned Start</th>
                        <th>Planned End</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeSprint.phases || []).map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.number}</strong></td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.owner}</td>
                          <td>
                            <span className="cell-phase-chip">{p.status}</span>
                          </td>
                          <td>{p.plannedStartDate}</td>
                          <td>{p.plannedEndDate}</td>
                          <td>{p.progress}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT SPRINT PARAMETERS MODAL */}
      {editingSprint && (
        <div className="modal-backdrop-custom" onClick={() => setEditingSprint(null)}>
          <div className="modal-dialog-custom card-styled" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Edit Parameters: {editingSprint.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingSprint(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveSprint}>
              <div className="modal-body-custom">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Sprint Name</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingSprint.name}
                      onChange={e => setEditingSprint({ ...editingSprint, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Sprint Year</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={editingSprint.year}
                      onChange={e => setEditingSprint({ ...editingSprint, year: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingSprint.startDate}
                      onChange={e => setEditingSprint({ ...editingSprint, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={editingSprint.endDate}
                      onChange={e => setEditingSprint({ ...editingSprint, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Sprint Capacity (Mandays)</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={editingSprint.capacity}
                      onChange={e => setEditingSprint({ ...editingSprint, capacity: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Sprint Status</label>
                    <select
                      className="form-input-field"
                      value={editingSprint.status}
                      onChange={e => setEditingSprint({ ...editingSprint, status: e.target.value })}
                    >
                      {Object.values(SPRINT_STATUSES).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Overall Sprint Health</label>
                    <select
                      className="form-input-field"
                      value={editingSprint.health || SPRINT_HEALTH.ON_TRACK}
                      onChange={e => setEditingSprint({ ...editingSprint, health: e.target.value })}
                    >
                      {Object.values(SPRINT_HEALTH).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-field">
                    <label>Current Phase</label>
                    <select
                      className="form-input-field"
                      value={editingSprint.currentPhase}
                      onChange={e => setEditingSprint({ ...editingSprint, currentPhase: e.target.value })}
                    >
                      {SPRINT_PHASE_NAMES.map(ph => (
                        <option key={ph} value={ph}>{ph}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group-field">
                  <label>Sprint Objective / Goal</label>
                  <textarea
                    rows="2"
                    className="form-input-field"
                    value={editingSprint.goal}
                    onChange={e => setEditingSprint({ ...editingSprint, goal: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Sprint Owner</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={editingSprint.owner || ''}
                    onChange={e => setEditingSprint({ ...editingSprint, owner: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditingSprint(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SPRINT MODAL */}
      {isCreatingNew && (
        <div className="modal-backdrop-custom" onClick={() => setIsCreatingNew(false)}>
          <div className="modal-dialog-custom card-styled" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Create New Sprint</h3>
              <button className="modal-close-btn" onClick={() => setIsCreatingNew(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateNewSprint}>
              <div className="modal-body-custom">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Sprint Name *</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={newSprintData.name}
                      onChange={e => setNewSprintData({ ...newSprintData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Sprint Number</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={newSprintData.number}
                      onChange={e => setNewSprintData({ ...newSprintData, number: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={newSprintData.startDate}
                      onChange={e => setNewSprintData({ ...newSprintData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-input-field"
                      value={newSprintData.endDate}
                      onChange={e => setNewSprintData({ ...newSprintData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Sprint Capacity (Mandays)</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={newSprintData.capacity}
                      onChange={e => setNewSprintData({ ...newSprintData, capacity: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Sprint Year</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={newSprintData.year}
                      onChange={e => setNewSprintData({ ...newSprintData, year: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label>Sprint Goal / Objective</label>
                  <textarea
                    rows="2"
                    className="form-input-field"
                    value={newSprintData.goal}
                    onChange={e => setNewSprintData({ ...newSprintData, goal: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setIsCreatingNew(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
