import React, { useState } from 'react';
import { ROLES, ROLE_LABELS, DEMO_AVATARS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function UserControlPage() {
  const { users, currentUser, addUser, updateUser, deleteUser, canManageUsers } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'add' | 'matrix'
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(ROLES.CONTRIBUTOR);
  const [newAvatar, setNewAvatar] = useState(DEMO_AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleRoleChange = async (user, nextRole) => {
    try {
      await updateUser({ ...user, role: nextRole });
      showToast(`Updated ${user.name} to ${ROLE_LABELS[nextRole]}`);
    } catch (err) {
      showToast('Failed to update role');
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
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
    <div className="user-control-page-wrapper">
      <div className="user-control-card-container">
        {/* Header */}
        <header className="uc-page-head">
          <div className="modal-title-wrap">
            <h1 className="uc-page-title">User Control Panel</h1>
            <span className="modal-sub">Role-Based Access Control (RBAC) System</span>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="user-control-tabs">
          <button
            type="button"
            className={`uc-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users Directory ({users.length})
          </button>
          <button
            type="button"
            className={`uc-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            + Add New User
          </button>
          <button
            type="button"
            className={`uc-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            Roles &amp; Privileges
          </button>
        </div>

        {/* Tab 1: Users Directory */}
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
                          {isCurrent && <span className="you-badge">YOU</span>}
                        </div>
                        <span className="user-row-email">{u.email}</span>
                      </div>
                    </div>

                    <div className="user-row-right">
                      {canManageUsers ? (
                        <div className="role-grant-group">
                          <span className="role-grant-label">Grant Role:</span>
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
                          type="button"
                          className="btn-delete-user"
                          title={`Remove ${u.name}`}
                          onClick={() => handleDelete(u)}
                          aria-label={`Remove user ${u.name}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
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
          <div className="user-control-body">
            <form className="add-user-form" onSubmit={handleCreateUser}>
              <div className="form-group-field">
                <label htmlFor="ucNewName">Full Name</label>
                <input
                  id="ucNewName"
                  type="text"
                  className="form-input-field"
                  placeholder="e.g. Jessica Taylor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="ucNewEmail">Email Address</label>
                <input
                  id="ucNewEmail"
                  type="email"
                  className="form-input-field"
                  placeholder="e.g. jessica.t@novaboard.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="ucNewRole">Assigned Role</label>
                <select
                  id="ucNewRole"
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
                <div className="avatar-options-grid">
                  {DEMO_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`avatar-choice-btn ${newAvatar === av ? 'selected' : ''}`}
                      onClick={() => setNewAvatar(av)}
                    >
                      <img src={av} alt={`Avatar ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn-add-task-yellow" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Roles & Privileges Matrix */}
        {activeTab === 'matrix' && (
          <div className="user-control-body">
            <div className="permissions-matrix-container">
              <div className="matrix-role-cards">
                <div className="matrix-role-card role-admin-card">
                  <div className="matrix-role-header">
                    <span className="role-pill-badge role-admin">1. Administrator</span>
                  </div>
                  <h3 className="matrix-role-title">Full Authority</h3>
                  <p className="matrix-role-desc">Has complete administrative governance over tasks and user accounts.</p>
                  <ul className="matrix-features-list">
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Full CRUD on all sprint tasks</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Drag-and-drop task stage changes</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Permanent task deletion</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Manage Users: Add, remove, &amp; grant roles</li>
                  </ul>
                </div>

                <div className="matrix-role-card role-contributor-card">
                  <div className="matrix-role-header">
                    <span className="role-pill-badge role-contributor">2. Contributor</span>
                  </div>
                  <h3 className="matrix-role-title">Task Manipulator</h3>
                  <p className="matrix-role-desc">Can manipulate tasks throughout development and sprint delivery.</p>
                  <ul className="matrix-features-list">
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Create new tasks &amp; features</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Edit task details, notes, assignees</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Move task stages via drag-and-drop</li>
                    <li className="matrix-feature-item"><span className="feature-cross">✗</span> Cannot delete tasks or manage users</li>
                  </ul>
                </div>

                <div className="matrix-role-card role-viewer-card">
                  <div className="matrix-role-header">
                    <span className="role-pill-badge role-viewer">3. Viewer</span>
                  </div>
                  <h3 className="matrix-role-title">Observation Only</h3>
                  <p className="matrix-role-desc">Provides read-only access for stakeholders, auditors, and guests.</p>
                  <ul className="matrix-features-list">
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> View Kanban Board, List, &amp; Calendar</li>
                    <li className="matrix-feature-item"><span className="feature-check">✓</span> Inspect task specifications</li>
                    <li className="matrix-feature-item"><span className="feature-cross">✗</span> Cannot create, edit, or delete tasks</li>
                    <li className="matrix-feature-item"><span className="feature-cross">✗</span> Drag-and-drop manipulation blocked</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
