import React, { useState, useEffect, useMemo } from 'react';
import { PRIORITIES, DEFAULT_PLATFORMS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { MultiValueInput } from '../common/MultiValueInput';
import { DatePicker } from '../common/DatePicker';
import { splitMultiValue, joinMultiValue } from '../../utils/taskHelpers';

const TABS = [
  { id: 'overview', label: 'Overview & Core' },
  { id: 'business', label: 'Business & Requirements' },
  { id: 'governance', label: 'Governance & Prio' },
  { id: 'dev', label: 'Sprint & Dev' },
  { id: 'dates_links', label: 'Timeline & Artifacts' }
];

export function TaskEditModal({
  task,
  onClose,
  onSave,
  onDelete,
  platformSuggestions: propPlatforms,
  assigneeSuggestions: propAssignees
}) {
  const { canManipulateTasks, canDeleteTasks, isViewer, users } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    ...task,
    platforms: splitMultiValue(task?.platforms || task?.platform),
    assignees: splitMultiValue(task?.assignees || task?.assignee)
  });

  // Suggestions for platform
  const platforms = useMemo(() => {
    if (propPlatforms && propPlatforms.length > 0) {
      return Array.from(new Set([...propPlatforms, ...DEFAULT_PLATFORMS]));
    }
    return DEFAULT_PLATFORMS;
  }, [propPlatforms]);

  const quickPlatforms = useMemo(() => {
    return ['AYO Toko', 'CITA', 'My Hero', 'AYO Kasir'];
  }, []);

  // Suggestions for assignee
  const assignees = useMemo(() => {
    if (propAssignees && propAssignees.length > 0) {
      return propAssignees;
    }
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role
    }));
  }, [propAssignees, users]);

  const quickAssignees = useMemo(() => {
    return users.slice(0, 4).map(u => u.name);
  }, [users]);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        title: task.title || task.epic || '',
        epic: task.epic || task.title || '',
        platforms: splitMultiValue(task.platforms || task.platform),
        assignees: splitMultiValue(task.assignees || task.assignee)
      });
    }
  }, [task]);

  const handleChange = (e) => {
    if (!canManipulateTasks) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value
    }));
  };

  const handlePlatformsChange = (newPlatforms) => {
    if (!canManipulateTasks) return;
    setFormData(prev => ({
      ...prev,
      platforms: newPlatforms,
      platform: joinMultiValue(newPlatforms)
    }));
  };

  const handleAssigneesChange = (newAssignees) => {
    if (!canManipulateTasks) return;
    setFormData(prev => ({
      ...prev,
      assignees: newAssignees,
      assignee: joinMultiValue(newAssignees)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManipulateTasks) return;

    const payload = {
      ...formData,
      title: formData.title || formData.epic || 'Untitled',
      epic: formData.epic || formData.title || 'Untitled',
      platforms: formData.platforms || splitMultiValue(formData.platform),
      platform: joinMultiValue(formData.platforms || formData.platform),
      assignees: formData.assignees || splitMultiValue(formData.assignee),
      assignee: joinMultiValue(formData.assignees || formData.assignee)
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
      <div className="modal-dialog modal-dialog-spacious modal-dialog-tabs" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 id="editModalTitle">
              {canManipulateTasks ? 'Edit Task Details' : 'Task Details'}
              {formData.ticket_code && (
                <span className="modal-ticket-badge">{formData.ticket_code}</span>
              )}
            </h2>
            {isViewer && (
              <span className="role-pill-badge role-viewer" style={{ fontSize: 11, padding: '2px 8px' }}>
                Read-Only (Viewer)
              </span>
            )}
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {isViewer && (
          <div className="modal-readonly-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>You are viewing this task in read-only mode. Only Contributors and Administrators can make changes.</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="modal-nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`modal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-content tabbed-form-content">
            {/* TAB 1: OVERVIEW & CORE */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskTitle">Task Title / Epic *</label>
                    <input
                      id="taskTitle"
                      name="title"
                      type="text"
                      className="form-input-field"
                      value={formData.title || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                      required
                    />
                  </div>

                  <div className="form-grid-2col-nested">
                    <div className="form-group-field">
                      <label htmlFor="taskTicketCode">Ticket Code</label>
                      <input
                        id="taskTicketCode"
                        name="ticket_code"
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. S8-001"
                        value={formData.ticket_code || ''}
                        onChange={handleChange}
                        disabled={!canManipulateTasks}
                      />
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="taskNo">No</label>
                      <input
                        id="taskNo"
                        name="no"
                        type="text"
                        className="form-input-field"
                        placeholder="Seq No"
                        value={formData.no || ''}
                        onChange={handleChange}
                        disabled={!canManipulateTasks}
                      />
                    </div>
                  </div>
                </div>

                {/* Platform(s) Section */}
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <div className="field-label-row">
                      <label htmlFor="taskPlatform">Platform(s)</label>
                      <span className="field-hint-text">Add multiple platforms</span>
                    </div>
                    <MultiValueInput
                      id="taskPlatform"
                      name="platforms"
                      placeholder="Type platform & press Enter..."
                      values={formData.platforms}
                      onChange={handlePlatformsChange}
                      disabled={!canManipulateTasks}
                      suggestions={platforms}
                      quickPills={quickPlatforms}
                      type="platform"
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskSubPlatform">Sub-Platform</label>
                    <input
                      id="taskSubPlatform"
                      name="sub_platform"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Backoffice, Driver App..."
                      value={formData.sub_platform || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                {/* Assignee(s) & PM Section */}
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <div className="field-label-row">
                      <label htmlFor="taskAssignee">Assignee(s)</label>
                      <span className="field-hint-text">Add team members</span>
                    </div>
                    <MultiValueInput
                      id="taskAssignee"
                      name="assignees"
                      placeholder="Type assignee & press Enter..."
                      values={formData.assignees}
                      onChange={handleAssigneesChange}
                      disabled={!canManipulateTasks}
                      suggestions={assignees}
                      quickPills={quickAssignees}
                      type="assignee"
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskPmName">PM Name</label>
                    <input
                      id="taskPmName"
                      name="pm_name"
                      type="text"
                      className="form-input-field"
                      placeholder="Product Manager name"
                      value={formData.pm_name || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                {/* Stage, Priority & Dev Status */}
                <div className="form-grid-3col">
                  <div className="form-group-field">
                    <label htmlFor="taskStage">Kanban Stage</label>
                    <select
                      id="taskStage"
                      name="stage"
                      className="form-input-field"
                      value={formData.stage || 'todo'}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskFinalDevStatus">Final Dev Status</label>
                    <input
                      id="taskFinalDevStatus"
                      name="final_dev_status"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Done, WIP, Drop..."
                      value={formData.final_dev_status || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskPriority">Priority</label>
                    <select
                      id="taskPriority"
                      name="priority"
                      className="form-input-field"
                      value={formData.priority || PRIORITIES.MEDIUM}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    >
                      <option value={PRIORITIES.HIGH}>High</option>
                      <option value={PRIORITIES.MEDIUM}>Medium</option>
                      <option value={PRIORITIES.LOW}>Low</option>
                    </select>
                  </div>
                </div>

                {/* Progress & Mandays */}
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskProgress">Progress: {formData.progress || 0}%</label>
                    <input
                      id="taskProgress"
                      name="progress"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="form-input-field"
                      value={formData.progress || 0}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-grid-2col-nested">
                    <div className="form-group-field">
                      <label htmlFor="taskMandays">Mandays (MD)</label>
                      <input
                        id="taskMandays"
                        name="mandays"
                        type="text"
                        className="form-input-field"
                        value={formData.mandays || '0'}
                        onChange={handleChange}
                        disabled={!canManipulateTasks}
                      />
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="taskWeightMandays">Weight (Mandays)</label>
                      <input
                        id="taskWeightMandays"
                        name="weight_mandays"
                        type="text"
                        className="form-input-field"
                        value={formData.weight_mandays || ''}
                        onChange={handleChange}
                        disabled={!canManipulateTasks}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BUSINESS & REQUIREMENTS */}
            {activeTab === 'business' && (
              <div className="tab-pane">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskBusinessOwnerPic">Business Owner PIC</label>
                    <input
                      id="taskBusinessOwnerPic"
                      name="business_owner_pic"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Commercial Team, Ops..."
                      value={formData.business_owner_pic || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskCategory">Category</label>
                    <input
                      id="taskCategory"
                      name="category"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Feature, Bug, Optimization..."
                      value={formData.category || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskImpact">Impact (must be in number)</label>
                    <input
                      id="taskImpact"
                      name="impact"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. 5000000, 1000 users..."
                      value={formData.impact || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskChangesPrincipalRole">Changes in Principal Role / Require New Menu</label>
                    <input
                      id="taskChangesPrincipalRole"
                      name="changes_principal_role"
                      type="text"
                      className="form-input-field"
                      placeholder="Yes / No / Details..."
                      value={formData.changes_principal_role || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="taskBackground">Background</label>
                  <textarea
                    id="taskBackground"
                    name="background"
                    className="form-input-field"
                    rows="2"
                    placeholder="Problem statement / context..."
                    value={formData.background || ''}
                    onChange={handleChange}
                    disabled={!canManipulateTasks}
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="taskObjective">Objective</label>
                  <textarea
                    id="taskObjective"
                    name="objective"
                    className="form-input-field"
                    rows="2"
                    placeholder="Desired goal or target outcome..."
                    value={formData.objective || ''}
                    onChange={handleChange}
                    disabled={!canManipulateTasks}
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="taskDescription">Description</label>
                  <textarea
                    id="taskDescription"
                    name="description"
                    className="form-input-field"
                    rows="3"
                    placeholder="Scope, functional criteria & notes..."
                    value={formData.description || ''}
                    onChange={handleChange}
                    disabled={!canManipulateTasks}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: GOVERNANCE & PRIORITIZATION */}
            {activeTab === 'governance' && (
              <div className="tab-pane">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskProposalPrioRank">Proposal Prio Rank</label>
                    <input
                      id="taskProposalPrioRank"
                      name="proposal_prio_rank"
                      type="text"
                      className="form-input-field"
                      placeholder="Business / CI Manager rank"
                      value={formData.proposal_prio_rank || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskFinalPrioRank">Final Prio Rank</label>
                    <input
                      id="taskFinalPrioRank"
                      name="final_prio_rank"
                      type="text"
                      className="form-input-field"
                      placeholder="Governance Team rank"
                      value={formData.final_prio_rank || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskPrevPrio">Prev Prio</label>
                    <input
                      id="taskPrevPrio"
                      name="prev_prio"
                      type="text"
                      className="form-input-field"
                      placeholder="Previous priority ranking"
                      value={formData.prev_prio || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskSharedProductTeam">Shared to Product Team</label>
                    <input
                      id="taskSharedProductTeam"
                      name="shared_product_team"
                      type="text"
                      className="form-input-field"
                      placeholder="Sharing confirmation / notes"
                      value={formData.shared_product_team || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="taskReasonCancelDeprio">Reason if Cancel / Deprio</label>
                  <textarea
                    id="taskReasonCancelDeprio"
                    name="reason_cancel_deprio"
                    className="form-input-field"
                    rows="3"
                    placeholder="Explanation if ticket is cancelled, postponed, or deprioritized..."
                    value={formData.reason_cancel_deprio || ''}
                    onChange={handleChange}
                    disabled={!canManipulateTasks}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: SPRINT & DEV */}
            {activeTab === 'dev' && (
              <div className="tab-pane">
                <div className="form-grid-3col">
                  <div className="form-group-field">
                    <label htmlFor="taskDevelopInSprint">Develop in Sprint?</label>
                    <input
                      id="taskDevelopInSprint"
                      name="develop_in_sprint"
                      type="text"
                      className="form-input-field"
                      placeholder="Yes / No"
                      value={formData.develop_in_sprint || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskCrossSprint">Cross Sprint?</label>
                    <input
                      id="taskCrossSprint"
                      name="cross_sprint"
                      type="text"
                      className="form-input-field"
                      placeholder="Yes / No"
                      value={formData.cross_sprint || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskCrossSprintTo">Cross Sprint to?</label>
                    <input
                      id="taskCrossSprintTo"
                      name="cross_sprint_to"
                      type="text"
                      className="form-input-field"
                      placeholder="Sprint number / target"
                      value={formData.cross_sprint_to || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskTicket1stShown">Ticket 1st shown in Sprint</label>
                    <input
                      id="taskTicket1stShown"
                      name="ticket_1st_shown"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Sprint 7"
                      value={formData.ticket_1st_shown || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskStartDevInSprint">Start Development in Sprint</label>
                    <input
                      id="taskStartDevInSprint"
                      name="start_dev_in_sprint"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Sprint 8"
                      value={formData.start_dev_in_sprint || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskMandaysSe">Mandays Consumption (Software Engineer)</label>
                    <input
                      id="taskMandaysSe"
                      name="mandays_consumption_se"
                      type="text"
                      className="form-input-field"
                      placeholder="SE Mandays"
                      value={formData.mandays_consumption_se || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskMandaysItpd">Mandays Consumption ITPD (Test & Pre-UAT)</label>
                    <input
                      id="taskMandaysItpd"
                      name="mandays_consumption_itpd"
                      type="text"
                      className="form-input-field"
                      placeholder="ITPD Mandays"
                      value={formData.mandays_consumption_itpd || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TIMELINE & ARTIFACTS */}
            {activeTab === 'dates_links' && (
              <div className="tab-pane">
                <div className="form-grid-3col">
                  <div className="form-group-field">
                    <label htmlFor="taskBrdSubmissionDate">BRD Submission Date</label>
                    <DatePicker
                      id="taskBrdSubmissionDate"
                      name="brd_submission_date"
                      value={formData.brd_submission_date || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskPrdCreationDate">PRD Creation Date</label>
                    <DatePicker
                      id="taskPrdCreationDate"
                      name="prd_creation_date"
                      value={formData.prd_creation_date || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskDateSharingReqSe">Date Sharing Req to SE</label>
                    <DatePicker
                      id="taskDateSharingReqSe"
                      name="date_sharing_req_se"
                      value={formData.date_sharing_req_se || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskUatDate">UAT Date</label>
                    <DatePicker
                      id="taskUatDate"
                      name="uat_date"
                      value={formData.uat_date || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskDeploymentDate">Deployment Date</label>
                    <DatePicker
                      id="taskDeploymentDate"
                      name="deployment_date"
                      value={formData.deployment_date || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskJiraTicketNumber">Jira Ticket Number</label>
                    <input
                      id="taskJiraTicketNumber"
                      name="jira_ticket_number"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. PROJ-1234"
                      value={formData.jira_ticket_number || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskTotalTickets"># Total Ticket(s) Generated</label>
                    <input
                      id="taskTotalTickets"
                      name="total_tickets_generated"
                      type="text"
                      className="form-input-field"
                      placeholder="Number of sub-tickets"
                      value={formData.total_tickets_generated || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="taskBrd">BRD Document Link</label>
                  <input
                    id="taskBrd"
                    name="brd"
                    type="text"
                    className="form-input-field"
                    placeholder="URL or document reference..."
                    value={formData.brd || ''}
                    onChange={handleChange}
                    disabled={!canManipulateTasks}
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="taskFinalRemarks">Final Remarks</label>
                    <textarea
                      id="taskFinalRemarks"
                      name="final_remarks"
                      className="form-input-field"
                      rows="2"
                      placeholder="Sprinter final remarks..."
                      value={formData.final_remarks || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="taskRemark">Remark</label>
                    <textarea
                      id="taskRemark"
                      name="remark"
                      className="form-input-field"
                      rows="2"
                      placeholder="General remarks..."
                      value={formData.remark || ''}
                      onChange={handleChange}
                      disabled={!canManipulateTasks}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-foot">
            {canDeleteTasks ? (
              <button
                type="button"
                className="pill-action-btn"
                style={{ color: '#ef4444' }}
                onClick={() => onDelete(formData.id)}
              >
                Delete
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: 10 }}>
              {!canManipulateTasks ? (
                <button type="button" className="pill-action-btn" onClick={onClose}>
                  Close
                </button>
              ) : (
                <>
                  <button type="button" className="pill-action-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-add-task-yellow">Save Changes</button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
