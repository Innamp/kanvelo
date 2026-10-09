import React, { useState, useMemo } from 'react';
import { PRIORITIES, STAGES, DEFAULT_PLATFORMS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { AutocompleteInput } from '../common/AutocompleteInput';

const INITIAL_TASK_STATE = {
  title: '',
  platform: 'AYO Toko',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onCreate(formData);
    setFormData(INITIAL_TASK_STATE);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="createModalTitle">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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

            <div className="form-grid-2col">
              <div className="form-group-field">
                <label htmlFor="newPlatform">Platform</label>
                <AutocompleteInput
                  id="newPlatform"
                  name="platform"
                  placeholder="e.g. AYO Toko, CITA"
                  value={formData.platform}
                  onChange={handleChange}
                  suggestions={platforms}
                  quickPills={quickPlatforms}
                  type="platform"
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="newAssignee">Assignee</label>
                <AutocompleteInput
                  id="newAssignee"
                  name="assignee"
                  placeholder="e.g. John Doe"
                  value={formData.assignee}
                  onChange={handleChange}
                  suggestions={assignees}
                  quickPills={quickAssignees}
                  type="assignee"
                />
              </div>
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
