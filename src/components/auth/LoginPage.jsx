import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants';
import { Avatar } from '../common/Avatar';

export function LoginPage() {
  const { users, login, loginAsUser } = useAuth();
  const [email, setEmail] = useState('john.doe@novaboard.io');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate micro network delay for realistic experience
      await new Promise(r => setTimeout(r, 250));
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user) => {
    setError('');
    loginAsUser(user);
  };

  return (
    <div className="login-page-container">
      {/* Background Decorative Elements */}
      <div className="login-bg-shape login-bg-shape-1" aria-hidden="true" />
      <div className="login-bg-shape login-bg-shape-2" aria-hidden="true" />

      <main className="login-card-shell">
        {/* Left / Brand Showcase Column */}
        <section className="login-brand-side">
          <div className="login-brand-header">
            <div className="login-logo-pill">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#facc15" stroke="#0f172a" />
              </svg>
              <span className="login-brand-name">Kanvelo</span>
            </div>
            <span className="login-version-tag">Sprint 10 Edition</span>
          </div>

          <div className="login-hero-copy">
            <h1 className="login-hero-title">
              Fast, Modern &amp; Dynamic <br />
              <span className="hero-gradient-text">Sprint Orchestration</span>
            </h1>
            <p className="login-hero-subtitle">
              Manage product backlogs, track real-time task workflows, and enforce
              clean multi-tier access control across your engineering team.
            </p>
          </div>

          {/* Role matrix summary */}
          <div className="login-roles-glance">
            <span className="roles-glance-heading">3-Tier Access Control Included:</span>
            <div className="roles-glance-grid">
              <div className="role-glance-item">
                <div className="glance-badge role-admin">Administrator</div>
                <p>Full control over tasks, sprints, and user account management.</p>
              </div>
              <div className="role-glance-item">
                <div className="glance-badge role-contributor">Contributor</div>
                <p>Create, edit, and move tasks across Kanban stages.</p>
              </div>
              <div className="role-glance-item">
                <div className="glance-badge role-viewer">Viewer</div>
                <p>Read-only access to view boards, lists, and sprint charts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right / Form Column */}
        <section className="login-form-side">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your dashboard or choose a demo role below.</p>
          </div>

          {/* Quick Demo 1-Click Role Switcher */}
          <div className="quick-login-section">
            <div className="quick-login-header">
              <span className="quick-login-label">Quick 1-Click Demo Login</span>
              <span className="quick-login-hint">Instant access by role</span>
            </div>

            <div className="quick-users-list">
              {users.map((u) => {
                const roleKey = u.role || ROLES.VIEWER;
                return (
                  <button
                    key={u.id}
                    type="button"
                    className="quick-user-card"
                    onClick={() => handleQuickLogin(u)}
                    title={`Log in as ${u.name} (${ROLE_LABELS[roleKey]})`}
                  >
                    <Avatar name={u.name} size={36} className="quick-user-avatar" />
                    <div className="quick-user-info">
                      <div className="quick-user-top">
                        <strong className="quick-user-name">{u.name}</strong>
                        <span className={`role-pill-badge role-${roleKey}`}>
                          {ROLE_LABELS[roleKey]}
                        </span>
                      </div>
                      <span className="quick-user-email">{u.email}</span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="quick-enter-arrow"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="login-divider">
            <span>Or sign in with email</span>
          </div>

          {error && (
            <div className="login-error-alert" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="standard-login-form">
            <div className="form-group-field">
              <label htmlFor="loginEmail">Email Address</label>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="loginEmail"
                  type="email"
                  className="form-input-field"
                  placeholder="name@novaboard.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-field">
              <div className="password-label-row">
                <label htmlFor="loginPassword">Password</label>
                <span className="demo-hint-text">Any password works for demo</span>
              </div>
              <div className="input-with-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this session</span>
              </label>
              <span className="login-secure-notice">Protected by RBAC</span>
            </div>

            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-dots">Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Kanvelo</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
