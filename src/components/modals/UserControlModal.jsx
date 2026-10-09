import React, { useState } from 'react';
import { ROLES, ROLE_LABELS, DEMO_AVATARS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function UserControlModal({ isOpen, onClose }) {
  const { users, currentUser, addUser, updateUser, deleteUser, canManageUsers } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'add' | 'matrix'
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(ROLES.CONTRIBUTOR);
  const [newAvatar, setNewAvatar] = useState(DEMO_AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = async (user, nextRole) => {
    try {
      await updateUser({ ...user, role: nextRole });
      showToast(`Updated ${user.name} to ${ROLE_LABELS[nextRole]}`);
    } catch (err) {
      showToast('Failed to update role');
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) {
      if (!window.confirm('You are deleting your currently active account. Are you sure?')) return;
    } else {
      if (!window.confirm(`Delete user "${user.name}"?`)) return;
    }

    try {
      await deleteUser(user.id);
      showToast(`Deleted ${user.name}`);
    } catch (err) {
      showToast(err.message || 'Cannot delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Please provide name and email');
      return;
    }

    try {
      setSubmitting(true);
      await addUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        avatar: newAvatar
      });
      showToast(`User ${newName} created!`);
      setNewName('');
      setNewEmail('');
      setActiveTab('users');
    } catch (err) {
      showToast('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog user-control-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <div className="modal-title-wrap">
            <h2>User Control Panel</h2>
            <span className="modal-sub">Role-Based Access Control (RBAC) System</span>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {/* Modal Navigation Tabs */}
        <div className="user-control-tabs">
          <button
            className={`uc-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users Directory ({users.length})
          </button>
          <button
            className={`uc-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            + Add New User
          </button>
          <button
            className={`uc-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            Roles & Privileges
          </button>
        </div>

        {/* Tab 1: Users List */}
        {activeTab === 'users' && (
          <div className="user-control-body">
            <div className="users-directory-list">
              {users.map(u => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <div key={u.id} className="user-row-card">
                    <div className="user-row-left">
                      <img src={u.avatar} alt={u.name} className="user-row-avatar" />
                      <div className="user-row-details">
                        <div className="user-row-name-row">
                          <strong className="user-row-name">{u.name}</strong>
                          {isCurrent && <span className="you-badge">You</span>}
                        </div>
                        <span className="user-row-email">{u.email}</span>
                      </div>
                    </div>

                    <div className="user-row-right">
                      {canManageUsers ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Grant Role:</span>
                          <select
                            className={`role-select-box role-${u.role}`}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            title={`Grant role access to ${u.name}`}
                          >
                            <option value={ROLES.ADMIN}>Administrator (Full Access)</option>
                            <option value={ROLES.CONTRIBUTOR}>Contributor (Manipulate Tasks)</option>
                            <option value={ROLES.VIEWER}>Viewer (Read-Only)</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`role-pill-badge role-${u.role}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}

                      {canManageUsers && (
                        <button
                          className="btn-delete-user"
                          title={`Remove ${u.name}`}
                          onClick={() => handleDelete(u)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Add New User */}
        {activeTab === 'add' && (
          <form className="add-user-form" onSubmit={handleCreateUser}>
            <div className="form-group-field">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input-field"
                placeholder="e.g. Jessica Taylor"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-field">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input-field"
                placeholder="e.g. jessica.t@novaboard.io"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group-field">
              <label>Assigned Role</label>
              <select
                className="form-input-field"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value={ROLES.ADMIN}>Administrator (Full privileges + Manage users)</option>
                <option value={ROLES.CONTRIBUTOR}>Contributor (Can create & manipulate tasks)</option>
                <option value={ROLES.VIEWER}>Viewer (Read-only access)</option>
              </select>
            </div>

            <div className="form-group-field">
              <label>Select Avatar Profile</label>
              <div className="avatar-picker-row">
                {DEMO_AVATARS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="avatar option"
                    className={`avatar-choice ${newAvatar === av ? 'selected' : ''}`}
                    onClick={() => setNewAvatar(av)}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-submit-user" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User Account'}
            </button>
          </form>
        )}

        {/* Tab 3: Roles & Privileges Matrix */}
        {activeTab === 'matrix' && (
          <div className="role-matrix-content">
            <div className="role-card admin">
              <div className="role-card-head">
                <span className="role-chip admin">Administrator</span>
                <span className="role-scope">Full Control</span>
              </div>
              <ul className="role-feature-list">
                <li>✓ Full CRUD on all sprint tasks across stages</li>
                <li>✓ Drag-and-drop task stage changes</li>
                <li>✓ Permanent task deletion</li>
                <li>✓ User Management (Add, Edit Roles, Remove Users)</li>
              </ul>
            </div>

            <div className="role-card contributor">
              <div className="role-card-head">
                <span className="role-chip contributor">Contributor</span>
                <span className="role-scope">Task Manipulator</span>
              </div>
              <ul className="role-feature-list">
                <li>✓ Create new tasks & features</li>
                <li>✓ Edit task details, notes, assignees, progress</li>
                <li>✓ Move task stages via drag-and-drop & status selectors</li>
                <li>✗ Cannot delete tasks or manage user accounts</li>
              </ul>
            </div>

            <div className="role-card viewer">
              <div className="role-card-head">
                <span className="role-chip viewer">Viewer</span>
                <span className="role-scope">Read-Only</span>
              </div>
              <ul className="role-feature-list">
                <li>✓ View Kanban Board, Task List, Overview, and Milestones</li>
                <li>✓ Inspect full task specifications in read-only mode</li>
                <li>✗ Cannot create, edit, or delete tasks</li>
                <li>✗ Drag-and-drop manipulation is disabled</li>
              </ul>
            </div>
          </div>
        )}

        <footer className="modal-foot">
          <button type="button" className="pill-action-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
