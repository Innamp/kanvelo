import React, { useState, useEffect } from 'react';
import { PRIORITIES } from '../../constants';

export function TaskEditModal({ task, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({ ...task });

  useEffect(() => {
    setFormData({ ...task });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="editModalTitle">Edit Task Details</h2>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

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
              />
            </div>
          </div>

          <div className="modal-foot">
            <button
              type="button"
              className="pill-action-btn"
              style={{ color: '#ef4444' }}
              onClick={() => onDelete(formData.id)}
            >
              Delete
            </button>
            <button type="submit" className="btn-add-task-yellow">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
