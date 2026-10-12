import React, { useState, useMemo } from 'react';
import { PRIORITIES, STAGES, DEFAULT_PLATFORMS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { MultiValueInput } from '../common/MultiValueInput';
import { splitMultiValue, joinMultiValue } from '../../utils/taskHelpers';

const INITIAL_TASK_STATE = {
  title: '',
  platforms: ['AYO Toko'],
  platform: 'AYO Toko',
  assignees: [],
  assignee: '',
  stage: STAGES.TODO,
  priority: PRIORITIES.MEDIUM,
  description: '',
  mandays: '5'
};

export function TaskCreateModal({
  isOpen,
  onClose,
  onCreate,
  platformSuggestions: propPlatforms,
  assigneeSuggestions: propAssignees
}) {
  const { users } = useAuth();
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      platforms: formData.platforms || splitMultiValue(formData.platform),
      platform: joinMultiValue(formData.platforms || formData.platform),
      assignees: formData.assignees || splitMultiValue(formData.assignee),
      assignee: joinMultiValue(formData.assignees || formData.assignee)
    };

    onCreate(payload);
    setFormData(INITIAL_TASK_STATE);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="createModalTitle">
      <div className="modal-dialog modal-dialog-spacious" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="createModalTitle">Add New Task</h2>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-content">
            <div className="form-group-field">
              <label htmlFor="newTitle">Task Title *</label>
              <input
                id="newTitle"
                name="title"
                type="text"
                className="form-input-field"
                placeholder="e.g. Design Notification Banner"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Platform(s) Section */}
            <div className="form-group-field">
              <div className="field-label-row">
                <label htmlFor="newPlatform">Platform(s)</label>
                <span className="field-hint-text">Add multiple platforms without crowding into one line</span>
              </div>
              <MultiValueInput
                id="newPlatform"
                name="platforms"
                placeholder="Type platform & press Enter (or click + Add)..."
                values={formData.platforms}
                onChange={handlePlatformsChange}
                suggestions={platforms}
                quickPills={quickPlatforms}
                type="platform"
              />
            </div>

            {/* Assignee(s) Section */}
            <div className="form-group-field">
              <div className="field-label-row">
                <label htmlFor="newAssignee">Assignee(s)</label>
                <span className="field-hint-text">Add multiple team members as separate lines</span>
              </div>
              <MultiValueInput
                id="newAssignee"
                name="assignees"
                placeholder="Type assignee name & press Enter (or click + Add)..."
                values={formData.assignees}
                onChange={handleAssigneesChange}
                suggestions={assignees}
                quickPills={quickAssignees}
                type="assignee"
              />
            </div>

            <div className="form-grid-2col">
              <div className="form-group-field">
                <label htmlFor="newStage">Initial Stage</label>
                <select
                  id="newStage"
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
                <label htmlFor="newPriority">Priority</label>
                <select
                  id="newPriority"
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

            <div className="form-group-field">
              <label htmlFor="newDescription">Note / Description</label>
              <textarea
                id="newDescription"
                name="description"
                className="form-input-field"
                rows="2"
                placeholder="e.g. Ensure it adapts well in both light and dark themes."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="pill-action-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-add-task-yellow">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
