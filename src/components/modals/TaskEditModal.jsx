import React, { useState, useEffect } from 'react';
import { PRIORITIES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export function TaskEditModal({ task, onClose, onSave, onDelete }) {
  const { canManipulateTasks, canDeleteTasks, isViewer } = useAuth();
  const [formData, setFormData] = useState({ ...task });

  useEffect(() => {
    setFormData({ ...task });
  }, [task]);

  const handleChange = (e) => {
    if (!canManipulateTasks) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManipulateTasks) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 id="editModalTitle">{canManipulateTasks ? 'Edit Task Details' : 'Task Details'}</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-form-content">
            <div className="form-group-field">
              <label htmlFor="taskTitle">Task Title *</label>
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

            <div className="form-grid-2col">
              <div className="form-group-field">
                <label htmlFor="taskPlatform">Platform</label>
                <input
                  id="taskPlatform"
                  name="platform"
                  type="text"
                  className="form-input-field"
                  value={formData.platform || ''}
                  onChange={handleChange}
                  disabled={!canManipulateTasks}
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="taskAssignee">Assignee</label>
                <input
                  id="taskAssignee"
                  name="assignee"
                  type="text"
                  className="form-input-field"
                  value={formData.assignee || ''}
                  onChange={handleChange}
                  disabled={!canManipulateTasks}
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group-field">
                <label htmlFor="taskStage">Stage</label>
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

              <div className="form-group-field">
                <label htmlFor="taskMandays">Mandays (MD)</label>
                <input
                  id="taskMandays"
                  name="mandays"
                  type="text"
                  className="form-input-field"
                  value={formData.mandays || '5'}
                  onChange={handleChange}
                  disabled={!canManipulateTasks}
                />
              </div>
            </div>

            <div className="form-group-field">
              <label htmlFor="taskDescription">Note / Description</label>
              <textarea
                id="taskDescription"
                name="description"
                className="form-input-field"
                rows="3"
                value={formData.description || ''}
                onChange={handleChange}
                disabled={!canManipulateTasks}
              />
            </div>
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
