import React, { useState, useMemo } from 'react';
import { PRIORITIES, STAGES, DEFAULT_PLATFORMS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { MultiValueInput } from '../common/MultiValueInput';
import { DatePicker } from '../common/DatePicker';
import { YesNoSwitch } from '../common/YesNoSwitch';
import { splitMultiValue, joinMultiValue } from '../../utils/taskHelpers';

const TABS = [
  { id: 'overview', label: 'Overview & Core' },
  { id: 'business', label: 'Business & Requirements' },
  { id: 'governance', label: 'Governance & Prio' },
  { id: 'dev', label: 'Sprint & Dev' },
  { id: 'dates_links', label: 'Timeline & Artifacts' }
];

const INITIAL_TASK_STATE = {
  title: '',
  epic: '',
  no: '',
  ticket_code: '',
  platforms: ['AYO Toko'],
  platform: 'AYO Toko',
  sub_platform: '',
  assignees: [],
  assignee: '',
  pm_name: '',
  stage: STAGES.TODO,
  final_dev_status: '',
  priority: PRIORITIES.MEDIUM,
  progress: 0,
  mandays: '5',
  weight_mandays: '',
  business_owner_pic: '',
  category: '',
  impact: '',
  changes_principal_role: '',
  background: '',
  objective: '',
  description: '',
  proposal_prio_rank: '',
  final_prio_rank: '',
  prev_prio: '',
  shared_product_team: '',
  reason_cancel_deprio: '',
  develop_in_sprint: 'Yes',
  cross_sprint: 'No',
  cross_sprint_to: '',
  ticket_1st_shown: '',
  start_dev_in_sprint: '',
  mandays_consumption_se: '',
  mandays_consumption_itpd: '',
  brd_submission_date: '',
  prd_creation_date: '',
  date_sharing_req_se: '',
  uat_date: '',
  deployment_date: '',
  jira_ticket_number: '',
  total_tickets_generated: '',
  brd: '',
  final_remarks: '',
  remark: ''
};

export function TaskCreateModal({
  isOpen,
  onClose,
  onCreate,
  platformSuggestions: propPlatforms,
  assigneeSuggestions: propAssignees
}) {
  const { users } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState(INITIAL_TASK_STATE);

  // Platform suggestions list
  const platforms = useMemo(() => {
    if (propPlatforms && propPlatforms.length > 0) {
      return Array.from(new Set([...propPlatforms, ...DEFAULT_PLATFORMS]));
    }
    return DEFAULT_PLATFORMS;
  }, [propPlatforms]);

  const quickPlatforms = useMemo(() => {
    return ['AYO Toko', 'CITA', 'My Hero', 'AYO Kasir'];
  }, []);

  // Assignee suggestions list
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value
    }));
  };

  const handlePlatformsChange = (newPlatforms) => {
    setFormData(prev => ({
      ...prev,
      platforms: newPlatforms,
      platform: joinMultiValue(newPlatforms)
    }));
  };

  const handleAssigneesChange = (newAssignees) => {
    setFormData(prev => ({
      ...prev,
      assignees: newAssignees,
      assignee: joinMultiValue(newAssignees)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload = {
      ...formData,
      title: formData.title.trim(),
      epic: formData.epic.trim() || formData.title.trim(),
      platforms: formData.platforms || splitMultiValue(formData.platform),
      platform: joinMultiValue(formData.platforms || formData.platform),
      assignees: formData.assignees || splitMultiValue(formData.assignee),
      assignee: joinMultiValue(formData.assignees || formData.assignee)
    };

    onCreate(payload);
    setFormData(INITIAL_TASK_STATE);
    setActiveTab('overview');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="createModalTitle">
      <div className="modal-dialog modal-dialog-spacious modal-dialog-tabs" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="createModalTitle">Create New Sprint Task</h2>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

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
                    <label htmlFor="createTaskTitle">Task Title / Epic *</label>
                    <input
                      id="createTaskTitle"
                      name="title"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Implement bulk export feature"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-grid-2col-nested">
                    <div className="form-group-field">
                      <label htmlFor="createTicketCode">Ticket Code</label>
                      <input
                        id="createTicketCode"
                        name="ticket_code"
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. S8-154"
                        value={formData.ticket_code}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="createNo">No</label>
                      <input
                        id="createNo"
                        name="no"
                        type="text"
                        className="form-input-field"
                        placeholder="Seq No"
                        value={formData.no}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <div className="field-label-row">
                      <label htmlFor="createPlatform">Platform(s)</label>
                      <span className="field-hint-text">Add multiple platforms</span>
                    </div>
                    <MultiValueInput
                      id="createPlatform"
                      name="platforms"
                      placeholder="Type platform & press Enter..."
                      values={formData.platforms}
                      onChange={handlePlatformsChange}
                      suggestions={platforms}
                      quickPills={quickPlatforms}
                      type="platform"
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createSubPlatform">Sub-Platform</label>
                    <input
                      id="createSubPlatform"
                      name="sub_platform"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Backoffice, Driver..."
                      value={formData.sub_platform}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <div className="field-label-row">
                      <label htmlFor="createAssignee">Assignee(s)</label>
                      <span className="field-hint-text">Add team members</span>
                    </div>
                    <MultiValueInput
                      id="createAssignee"
                      name="assignees"
                      placeholder="Type assignee & press Enter..."
                      values={formData.assignees}
                      onChange={handleAssigneesChange}
                      suggestions={assignees}
                      quickPills={quickAssignees}
                      type="assignee"
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createPmName">PM Name</label>
                    <input
                      id="createPmName"
                      name="pm_name"
                      type="text"
                      className="form-input-field"
                      placeholder="Product Manager"
                      value={formData.pm_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-3col">
                  <div className="form-group-field">
                    <label htmlFor="createStage">Stage</label>
                    <select
                      id="createStage"
                      name="stage"
                      className="form-input-field"
                      value={formData.stage}
                      onChange={handleChange}
                    >
                      <option value={STAGES.TODO}>To Do</option>
                      <option value={STAGES.IN_PROGRESS}>In Progress</option>
                      <option value={STAGES.REVIEW}>In Review</option>
                      <option value={STAGES.COMPLETED}>Completed</option>
                    </select>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createFinalDevStatus">Final Dev Status</label>
                    <input
                      id="createFinalDevStatus"
                      name="final_dev_status"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Done, WIP"
                      value={formData.final_dev_status}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createPriority">Priority</label>
                    <select
                      id="createPriority"
                      name="priority"
                      className="form-input-field"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value={PRIORITIES.HIGH}>High</option>
                      <option value={PRIORITIES.MEDIUM}>Medium</option>
                      <option value={PRIORITIES.LOW}>Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createProgress">Progress: {formData.progress}%</label>
                    <input
                      id="createProgress"
                      name="progress"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="form-input-field"
                      value={formData.progress}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-grid-2col-nested">
                    <div className="form-group-field">
                      <label htmlFor="createMandays">Mandays (MD)</label>
                      <input
                        id="createMandays"
                        name="mandays"
                        type="text"
                        className="form-input-field"
                        value={formData.mandays}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="createWeightMandays">Weight (Mandays)</label>
                      <input
                        id="createWeightMandays"
                        name="weight_mandays"
                        type="text"
                        className="form-input-field"
                        placeholder="Estimated"
                        value={formData.weight_mandays}
                        onChange={handleChange}
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
                    <label htmlFor="createBusinessOwnerPic">Business Owner PIC</label>
                    <input
                      id="createBusinessOwnerPic"
                      name="business_owner_pic"
                      type="text"
                      className="form-input-field"
                      placeholder="PIC name"
                      value={formData.business_owner_pic}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createCategory">Category</label>
                    <input
                      id="createCategory"
                      name="category"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Feature, Bug, Optimization"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createImpact">Impact (must be in number)</label>
                    <input
                      id="createImpact"
                      name="impact"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. 1000000"
                      value={formData.impact}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createChangesRole">Changes in Principal Role / Require New Menu</label>
                    <YesNoSwitch
                      id="createChangesRole"
                      name="changes_principal_role"
                      value={formData.changes_principal_role}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="createBackground">Background</label>
                  <textarea
                    id="createBackground"
                    name="background"
                    className="form-input-field"
                    rows="2"
                    placeholder="Problem context / background..."
                    value={formData.background}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="createObjective">Objective</label>
                  <textarea
                    id="createObjective"
                    name="objective"
                    className="form-input-field"
                    rows="2"
                    placeholder="Objective / goal..."
                    value={formData.objective}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="createDescription">Description</label>
                  <textarea
                    id="createDescription"
                    name="description"
                    className="form-input-field"
                    rows="3"
                    placeholder="Detailed requirements..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: GOVERNANCE & PRIORITIZATION */}
            {activeTab === 'governance' && (
              <div className="tab-pane">
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createProposalPrioRank">Proposal Prio Rank</label>
                    <input
                      id="createProposalPrioRank"
                      name="proposal_prio_rank"
                      type="text"
                      className="form-input-field"
                      placeholder="CI Manager rank"
                      value={formData.proposal_prio_rank}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createFinalPrioRank">Final Prio Rank</label>
                    <input
                      id="createFinalPrioRank"
                      name="final_prio_rank"
                      type="text"
                      className="form-input-field"
                      placeholder="Gov Team rank"
                      value={formData.final_prio_rank}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createPrevPrio">Prev Prio</label>
                    <input
                      id="createPrevPrio"
                      name="prev_prio"
                      type="text"
                      className="form-input-field"
                      placeholder="Previous rank"
                      value={formData.prev_prio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createSharedProduct">Shared to Product Team</label>
                    <input
                      id="createSharedProduct"
                      name="shared_product_team"
                      type="text"
                      className="form-input-field"
                      placeholder="Status / notes"
                      value={formData.shared_product_team}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="createReasonCancel">Reason if Cancel / Deprio</label>
                  <textarea
                    id="createReasonCancel"
                    name="reason_cancel_deprio"
                    className="form-input-field"
                    rows="3"
                    placeholder="Reason..."
                    value={formData.reason_cancel_deprio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: SPRINT & DEV */}
            {activeTab === 'dev' && (
              <div className="tab-pane">
                <div className="form-grid-3col">
                  <div className="form-group-field">
                    <label htmlFor="createDevelopInSprint">Develop in Sprint?</label>
                    <YesNoSwitch
                      id="createDevelopInSprint"
                      name="develop_in_sprint"
                      value={formData.develop_in_sprint}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createCrossSprint">Cross Sprint?</label>
                    <YesNoSwitch
                      id="createCrossSprint"
                      name="cross_sprint"
                      value={formData.cross_sprint}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createCrossSprintTo">Cross Sprint to?</label>
                    <input
                      id="createCrossSprintTo"
                      name="cross_sprint_to"
                      type="text"
                      className="form-input-field"
                      placeholder="Sprint number"
                      value={formData.cross_sprint_to}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createTicket1stShown">Ticket 1st shown in Sprint</label>
                    <input
                      id="createTicket1stShown"
                      name="ticket_1st_shown"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Sprint 8"
                      value={formData.ticket_1st_shown}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createStartDevInSprint">Start Development in Sprint</label>
                    <input
                      id="createStartDevInSprint"
                      name="start_dev_in_sprint"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Sprint 8"
                      value={formData.start_dev_in_sprint}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createMandaysSe">Mandays Consumption (SE)</label>
                    <input
                      id="createMandaysSe"
                      name="mandays_consumption_se"
                      type="text"
                      className="form-input-field"
                      value={formData.mandays_consumption_se}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createMandaysItpd">Mandays Consumption ITPD</label>
                    <input
                      id="createMandaysItpd"
                      name="mandays_consumption_itpd"
                      type="text"
                      className="form-input-field"
                      value={formData.mandays_consumption_itpd}
                      onChange={handleChange}
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
                    <label htmlFor="createBrdSubmissionDate">BRD Submission Date</label>
                    <DatePicker
                      id="createBrdSubmissionDate"
                      name="brd_submission_date"
                      value={formData.brd_submission_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createPrdCreationDate">PRD Creation Date</label>
                    <DatePicker
                      id="createPrdCreationDate"
                      name="prd_creation_date"
                      value={formData.prd_creation_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createDateSharingReqSe">Date Sharing Req to SE</label>
                    <DatePicker
                      id="createDateSharingReqSe"
                      name="date_sharing_req_se"
                      value={formData.date_sharing_req_se}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createUatDate">UAT Date</label>
                    <DatePicker
                      id="createUatDate"
                      name="uat_date"
                      value={formData.uat_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createDeploymentDate">Deployment Date</label>
                    <DatePicker
                      id="createDeploymentDate"
                      name="deployment_date"
                      value={formData.deployment_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createJiraTicketNumber">Jira Ticket Number</label>
                    <input
                      id="createJiraTicketNumber"
                      name="jira_ticket_number"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. PROJ-123"
                      value={formData.jira_ticket_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createTotalTickets"># Total Tickets Generated</label>
                    <input
                      id="createTotalTickets"
                      name="total_tickets_generated"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. 4"
                      value={formData.total_tickets_generated}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="createBrd">BRD Document Link</label>
                  <input
                    id="createBrd"
                    name="brd"
                    type="text"
                    className="form-input-field"
                    placeholder="URL or document path..."
                    value={formData.brd}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label htmlFor="createFinalRemarks">Final Remarks</label>
                    <textarea
                      id="createFinalRemarks"
                      name="final_remarks"
                      className="form-input-field"
                      rows="2"
                      placeholder="Sprinter remarks..."
                      value={formData.final_remarks}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="createRemark">Remark</label>
                    <textarea
                      id="createRemark"
                      name="remark"
                      className="form-input-field"
                      rows="2"
                      placeholder="General remark..."
                      value={formData.remark}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-foot">
            <div />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="pill-action-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-add-task-yellow">
                Create Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
