import React, { useState, useMemo } from 'react';
import { ROLES, ROLE_LABELS } from '../../constants';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function UserControlView() {
  const { users, currentUser, addUser, updateUser, deleteUser, canManageUsers, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(ROLES.CONTRIBUTOR);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === ROLES.ADMIN).length;
    const contributors = users.filter(u => u.role === ROLES.CONTRIBUTOR).length;
    const viewers = users.filter(u => u.role === ROLES.VIEWER).length;
    return { total, admins, contributors, viewers };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Grant Access Role Handler
  const handleRoleChange = async (user, nextRole) => {
    if (!canManageUsers) {
      showToast('Only Administrators can grant access roles');
      return;
    }

    try {
      await updateUser({ ...user, role: nextRole });
      showToast(`Access updated: ${user.name} is now ${ROLE_LABELS[nextRole]}`);
    } catch (err) {
      showToast('Failed to update role');
    }
  };

  // Remove User Handler
  const handleRemoveUser = async (user) => {
    if (!canManageUsers) {
      showToast('Only Administrators can remove users');
      return;
    }

    // Safety checks
    if (user.role === ROLES.ADMIN && stats.admins <= 1) {
      showToast('Cannot remove the only Administrator in the system');
      return;
    }

    const isSelf = user.id === currentUser?.id;
    const confirmMsg = isSelf
      ? 'WARNING: You are removing your currently active account. Proceed?'
      : `Are you sure you want to remove user "${user.name}"? This action cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteUser(user.id);
      showToast(`User ${user.name} has been removed`);
    } catch (err) {
      showToast(err.message || 'Cannot delete user');
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!canManageUsers) {
      showToast('Only Administrators can add users');
      return;
    }

    if (!newName.trim() || !newEmail.trim()) {
      showToast('Please provide both name and email');
      return;
    }

    try {
      setIsSubmitting(true);
      await addUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        avatar: null
      });
      showToast(`New user "${newName}" added successfully!`);
      setNewName('');
      setNewEmail('');
      setNewRole(ROLES.CONTRIBUTOR);
      setIsAddModalOpen(false);
    } catch (err) {
      showToast('Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-control-view-container">
      {/* Top Banner / Heading */}
      <div className="uc-header-section">
        <div className="uc-header-left">
          <div className="uc-badge-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="uc-main-title">User Control Panel</h1>
          <p className="uc-sub-title">
            Add team members, grant access roles, and control permission tiers across the Kanvelo workspace.
          </p>
        </div>

        <div className="uc-header-actions">
          {canManageUsers ? (
            <button
              type="button"
              className="btn-add-member-cta"
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New User</span>
            </button>
          ) : (
            <div className="uc-readonly-notice">
              <span className="notice-icon">ℹ</span>
              <span>Only Administrators can modify user roles or add members.</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="uc-stats-grid">
        <div className="uc-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Users</span>
            <span className="stat-icon-wrap bg-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <span className="stat-desc">Active team members</span>
        </div>

        <div className="uc-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Administrators</span>
            <span className="stat-icon-wrap bg-purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </div>
          <div className="stat-value text-admin">{stats.admins}</div>
          <span className="stat-desc">Full authority &amp; user management</span>
        </div>

        <div className="uc-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Contributors</span>
            <span className="stat-icon-wrap bg-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
          </div>
          <div className="stat-value text-contributor">{stats.contributors}</div>
          <span className="stat-desc">Can create and manipulate tasks</span>
        </div>

        <div className="uc-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Viewers</span>
            <span className="stat-icon-wrap bg-gray">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </div>
          <div className="stat-value text-viewer">{stats.viewers}</div>
          <span className="stat-desc">Read-only task observation</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="uc-toolbar">
        <div className="uc-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="uc-search-input"
            placeholder="Search member by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn-clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="uc-role-filters">
          <button
            type="button"
            className={`filter-pill-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${roleFilter === ROLES.ADMIN ? 'active' : ''}`}
            onClick={() => setRoleFilter(ROLES.ADMIN)}
          >
            Administrators ({stats.admins})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${roleFilter === ROLES.CONTRIBUTOR ? 'active' : ''}`}
            onClick={() => setRoleFilter(ROLES.CONTRIBUTOR)}
          >
            Contributors ({stats.contributors})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${roleFilter === ROLES.VIEWER ? 'active' : ''}`}
            onClick={() => setRoleFilter(ROLES.VIEWER)}
          >
            Viewers ({stats.viewers})
          </button>
        </div>
      </div>

      {/* Users Directory Table Card */}
      <div className="uc-table-card">
        <table className="uc-users-table">
          <thead>
            <tr>
              <th>User &amp; Contact</th>
              <th>Current Role</th>
              <th>Permissions Summary</th>
              <th>Grant Access Role</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="uc-empty-state">
                  No users found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const isCurrent = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="uc-user-tr">
                    {/* User Profile */}
                    <td>
                      <div className="uc-user-cell">
                        <Avatar name={user.name} size={42} className="uc-table-avatar" />
                        <div className="uc-user-cell-meta">
                          <div className="uc-user-name-row">
                            <span className="uc-user-name">{user.name}</span>
                            {isCurrent && <span className="uc-badge-you">Current You</span>}
                          </div>
                          <span className="uc-user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td>
                      <span className={`role-pill-badge role-${user.role}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>

                    {/* Permissions Summary Description */}
                    <td>
                      <div className="uc-perm-summary">
                        {user.role === ROLES.ADMIN && (
                          <span className="perm-tag admin-tag">
                            ✓ Can do everything (Full CRUD + Manage Users)
                          </span>
                        )}
                        {user.role === ROLES.CONTRIBUTOR && (
                          <span className="perm-tag contrib-tag">
                            ✓ Can manipulate tasks (Create, Edit, Move)
                          </span>
                        )}
                        {user.role === ROLES.VIEWER && (
                          <span className="perm-tag viewer-tag">
                            ✓ Read-only observation (Cannot edit or move)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Grant Access Role Dropdown */}
                    <td>
                      {canManageUsers ? (
                        <div className="role-grant-wrap">
                          <select
                            className={`uc-role-selector role-${user.role}`}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            title={`Change access role for ${user.name}`}
                          >
                            <option value={ROLES.ADMIN}>Administrator (Full Access)</option>
                            <option value={ROLES.CONTRIBUTOR}>Contributor (Task Manipulator)</option>
                            <option value={ROLES.VIEWER}>Viewer (Read-Only)</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-muted-privilege">Protected (Admin only)</span>
                      )}
                    </td>

                    {/* Remove Action */}
                    <td className="td-actions">
                      {canManageUsers ? (
                        <button
                          type="button"
                          className="btn-remove-user-action"
                          onClick={() => handleRemoveUser(user)}
                          title={`Remove ${user.name} from workspace`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-muted-dash">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Role Privileges Matrix Reference Card */}
      <div className="uc-matrix-section">
        <h2 className="uc-matrix-heading">Role Access Privileges Matrix</h2>
        <p className="uc-matrix-sub">Clear breakdown of what each of the 3 roles is permitted to perform:</p>

        <div className="uc-matrix-cards-grid">
          <div className="matrix-tier-card admin-tier">
            <div className="tier-header">
              <span className="tier-badge role-admin">1. Administrator</span>
              <span className="tier-authority">Supreme Privilege</span>
            </div>
            <p className="tier-description">
              Has complete administrative governance over the entire Kanvelo system and team configuration.
            </p>
            <ul className="tier-list">
              <li><span className="check">✓</span> <strong>Manage Users:</strong> Add members, remove members, grant/change roles</li>
              <li><span className="check">✓</span> <strong>Full Task CRUD:</strong> Create, edit, move, and permanently delete tasks</li>
              <li><span className="check">✓</span> <strong>System Oversight:</strong> Access User Control Panel and audit logs</li>
            </ul>
          </div>

          <div className="matrix-tier-card contributor-tier">
            <div className="tier-header">
              <span className="tier-badge role-contributor">2. Contributor</span>
              <span className="tier-authority">Active Developer</span>
            </div>
            <p className="tier-description">
              Can manipulate sprint tasks throughout their development and delivery lifecycle.
            </p>
            <ul className="tier-list">
              <li><span className="check">✓</span> <strong>Manipulate Tasks:</strong> Create new sprint tasks and update attributes</li>
              <li><span className="check">✓</span> <strong>Drag-and-Drop:</strong> Move cards across To Do, In Progress, Review, Completed</li>
              <li><span className="cross">✗</span> <strong>Cannot Delete:</strong> Task deletions are restricted to administrators</li>
              <li><span className="cross">✗</span> <strong>No User Control:</strong> Cannot add, remove, or modify user roles</li>
            </ul>
          </div>

          <div className="matrix-tier-card viewer-tier">
            <div className="tier-header">
              <span className="tier-badge role-viewer">3. Viewer</span>
              <span className="tier-authority">Observation Only</span>
            </div>
            <p className="tier-description">
              Provides read-only access for stakeholders, clients, or auditing guests.
            </p>
            <ul className="tier-list">
              <li><span className="check">✓</span> <strong>View Tasks:</strong> Browse Kanban Board, Task List, Calendar, and Overview</li>
              <li><span className="cross">✗</span> <strong>No Task Creation:</strong> Cannot add or submit new tasks</li>
              <li><span className="cross">✗</span> <strong>No Modifications:</strong> Form fields disabled; drag-and-drop blocked</li>
              <li><span className="cross">✗</span> <strong>No User Control:</strong> Read-only observation across the app</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ width: 520 }}>
            <div className="modal-head">
              <h2>Add New User Account</h2>
              <button className="modal-close-icon" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-form-content">
                <div className="form-group-field">
                  <label htmlFor="modalNewName">Full Name *</label>
                  <input
                    id="modalNewName"
                    type="text"
                    className="form-input-field"
                    placeholder="e.g. David Miller"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="modalNewEmail">Email Address *</label>
                  <input
                    id="modalNewEmail"
                    type="email"
                    className="form-input-field"
                    placeholder="e.g. david.m@novaboard.io"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="modalNewRole">Access Role *</label>
                  <select
                    id="modalNewRole"
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
                  <label>Profile Avatar Preview</label>
                  <div className="avatar-initial-preview-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <Avatar name={newName || 'User'} size={44} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{newName || 'User Initials'}</strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Avatar initials and vibrant background are automatically generated</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="pill-action-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-task-yellow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
