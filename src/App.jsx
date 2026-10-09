import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_SPRINT_DATA } from './data/initialTasks';

const DEMO_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop'
];

function getAvatarUrl(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEMO_AVATARS[Math.abs(hash) % DEMO_AVATARS.length];
}

export default function App() {
  const [sprintId, setSprintId] = useState('sprint-10');
  const [currentView, setCurrentView] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stage');
  const [useApi, setUseApi] = useState(true);

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Show Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  // Load Tasks from SQLite API or Fallback
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`api.php?action=get_tasks&sprint_id=${sprintId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.tasks) {
            setTasks(data.tasks);
            setUseApi(true);
            return;
          }
        }
      } catch (err) {
        console.warn('SQLite API unavailable, using local data', err);
      }

      // Offline / GitHub Pages fallback
      setUseApi(false);
      const cached = localStorage.getItem(`novaboard_react_${sprintId}`);
      if (cached) {
        setTasks(JSON.parse(cached));
      } else {
        const sprintData = INITIAL_SPRINT_DATA[sprintId] || INITIAL_SPRINT_DATA['sprint-10'];
        setTasks(sprintData?.tasks || []);
      }
    }

    fetchTasks();
  }, [sprintId]);

  // Persist fallback to LocalStorage if API unavailable
  const persistTasks = (newTasks) => {
    setTasks(newTasks);
    if (!useApi) {
      localStorage.setItem(`novaboard_react_${sprintId}`, JSON.stringify(newTasks));
    }
  };

  // Drag and Drop Handling
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    let updatedProgress = 0;
    if (targetStage === 'completed') updatedProgress = 100;
    else if (targetStage === 'in-progress') updatedProgress = 60;
    else if (targetStage === 'review') updatedProgress = 85;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, stage: targetStage, progress: updatedProgress };
      }
      return t;
    });

    persistTasks(updated);

    if (useApi) {
      try {
        await fetch('api.php?action=update_stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, stage: targetStage, progress: updatedProgress })
        });
      } catch (err) {
        console.error('Failed to sync stage update to SQLite', err);
      }
    }

    showToast(`Task moved to ${targetStage.replace('-', ' ')}`);
  };

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    const q = search.toLowerCase().trim();

    if (q) {
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.platform && t.platform.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'priority') {
      const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
      list.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    } else if (sortBy === 'mandays') {
      list.sort((a, b) => parseFloat(b.mandays || 0) - parseFloat(a.mandays || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return list;
  }, [tasks, search, sortBy]);

  // Save Task (Edit)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const updated = tasks.map(t => t.id === editingTask.id ? editingTask : t);
    persistTasks(updated);

    if (useApi) {
      try {
        await fetch('api.php?action=save_task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingTask)
        });
      } catch (err) {
        console.error('Error saving task to SQLite', err);
      }
    }

    setEditingTask(null);
    showToast('Saved changes to SQLite database!');
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const updated = tasks.filter(t => t.id !== id);
    persistTasks(updated);

    if (useApi) {
      try {
        await fetch('api.php?action=delete_task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
      } catch (err) {
        console.error('Error deleting task from SQLite', err);
      }
    }

    setEditingTask(null);
    showToast('Task deleted from SQLite');
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newTask = {
      id: `${sprintId}-t${Date.now()}`,
      sprint_id: sprintId,
      title: form.addTitle.value,
      platform: form.addPlatform.value || 'General',
      assignee: form.addAssignee.value || 'Unassigned',
      stage: form.addStage.value,
      priority: form.addPriority.value,
      description: form.addNote.value,
      progress: form.addStage.value === 'completed' ? 100 : 0,
      mandays: '5',
      attachments_count: 0,
      comments_count: 1
    };

    const updated = [newTask, ...tasks];
    persistTasks(updated);

    if (useApi) {
      try {
        await fetch('api.php?action=save_task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
      } catch (err) {
        console.error('Error adding task to SQLite', err);
      }
    }

    setIsAddOpen(false);
    showToast('New task added to SQLite!');
  };

  // Keyboard shortcut ⌘S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'k')) {
        e.preventDefault();
        document.getElementById('headerSearchInput')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Columns definition
  const columns = [
    { key: 'todo', title: 'To Do', className: 'col-todo' },
    { key: 'in-progress', title: 'In Progress', className: 'col-progress' },
    { key: 'review', title: 'In Review', className: 'col-review' },
    { key: 'completed', title: 'Completed', className: 'col-completed' }
  ];

  return (
    <div className="app-shell">
      {/* 1. Floating Pill Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <div className="brand-mark" title="NovaBoard">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
            </svg>
          </div>

          <nav className="sidebar-nav">
            <button className={`nav-icon-btn ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setCurrentView('overview')} title="Home / Overview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>

            <button className={`nav-icon-btn ${currentView === 'board' ? 'active' : ''}`} onClick={() => setCurrentView('board')} title="Board">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect width="18" height="18" x="3" y="3" rx="3"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
              </svg>
            </button>

            <button className={`nav-icon-btn ${currentView === 'list' ? 'active' : ''}`} onClick={() => setCurrentView('list')} title="Task List">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </button>

            <button className={`nav-icon-btn ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setCurrentView('overview')} title="Team">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>

            <button className={`nav-icon-btn ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')} title="Calendar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-icon-btn" title="Settings">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="nav-icon-btn" title="Help & Support">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* 2. Workspace Content */}
      <main className="workspace">
        
        {/* Top Header */}
        <header className="workspace-header">
          <div className="search-field-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              id="headerSearchInput"
              className="search-field-input"
              placeholder="Search a task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-kbd-badge">⌘S</span>
          </div>

          <div className="header-user-section">
            <button className="bell-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              <span className="unread-dot"></span>
            </button>

            <div className="user-profile-chip">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" alt="John Doe" className="user-avatar-img" />
              <span className="user-profile-name">John Doe</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </header>

        {/* Project Title Banner */}
        <section className="project-banner">
          <div className="project-title-group">
            <h1>NovaBoard Mobile App</h1>
            <div className="project-meta-line">
              <span>Client: <strong style={{ color: 'var(--text-primary)' }}>Arcadia Solutions</strong></span>
              <span>•</span>
              <span>Timeline: <strong style={{ color: 'var(--text-primary)' }}>May 20 – June 30, 2025</strong></span>
              <span>•</span>
              <span className="meta-status-pill">In Progress</span>
            </div>
          </div>

          <div className="project-actions-group">
            <div className="avatar-group-stack">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop" className="avatar-stack-face" alt="User" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" className="avatar-stack-face" alt="User" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop" className="avatar-stack-face" alt="User" />
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop" className="avatar-stack-face" alt="User" />
              <div className="avatar-stack-count">+5</div>
            </div>

            <button className="pill-action-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!'); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" x2="12" y1="2" y2="15"/>
              </svg>
              Share
            </button>

            <button className="pill-action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>

            <button className="pill-action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Invite People
            </button>
          </div>
        </section>

        {/* View Switcher Tabs */}
        <nav className="view-tabs-bar">
          <button className={`tab-btn ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setCurrentView('overview')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
            </svg>
            Overview
          </button>

          <button className={`tab-btn ${currentView === 'list' ? 'active' : ''}`} onClick={() => setCurrentView('list')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/>
              <line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
            </svg>
            List
          </button>

          <button className={`tab-btn ${currentView === 'board' ? 'active' : ''}`} onClick={() => setCurrentView('board')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect width="18" height="18" x="3" y="3" rx="3"/><path d="M9 3v18"/><path d="M15 3v18"/>
            </svg>
            Board
          </button>

          <button className={`tab-btn ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            Calendar
          </button>

          <button className="tab-btn" onClick={() => showToast('Documents module')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            </svg>
            Documents
          </button>

          <button className="tab-btn" onClick={() => showToast('Messages module')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Messages
          </button>
        </nav>

        {/* Action & Filter Bar */}
        <div className="action-filter-bar">
          <div className="action-filters-left">
            <div className="filter-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                className="filter-search-input"
                placeholder="Search task"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
              <select className="pill-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="stage">Stage</option>
                <option value="priority">Priority</option>
                <option value="mandays">Mandays</option>
                <option value="title">Title</option>
              </select>
            </div>

            <select className="pill-dropdown" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              <option value="sprint-10">Sprint 10 (Current)</option>
              <option value="sprint-9">Sprint 9</option>
              <option value="sprint-8">Sprint 8</option>
              <option value="all">All Sprints</option>
            </select>

            <button className="pill-action-btn" onClick={() => showToast('Filters active')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
          </div>

          <button className="btn-add-task-yellow" onClick={() => setIsAddOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New Task
          </button>
        </div>

        {/* 3. Primary Views */}
        {currentView === 'board' && (
          <div className="board-container">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => (t.stage || 'todo') === col.key);

              return (
                <div
                  key={col.key}
                  className={`kanban-column ${col.className}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  <div className="col-header-bar">
                    <div className="col-header-left">
                      <span className="col-header-dot"></span>
                      <span className="col-header-title">{col.title}</span>
                    </div>
                    <button className="col-header-more">•••</button>
                  </div>

                  <div className="column-cards-stack">
                    {colTasks.map(t => {
                      const prio = t.priority || 'Medium';
                      const progress = t.progress !== undefined ? t.progress : (t.stage === 'completed' ? 100 : (t.stage === 'in-progress' ? 60 : 0));
                      const note = t.description || t.background || 'Ensure all acceptance criteria are met.';
                      const attachCount = t.attachments_count !== undefined ? t.attachments_count : (t.attachmentsCount || (t.title.length % 3));
                      const commentCount = t.comments_count !== undefined ? t.comments_count : (t.commentsCount || ((t.title.length % 5) + 1));

                      return (
                        <div
                          key={t.id}
                          className="task-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onClick={() => setEditingTask(t)}
                        >
                          <span className={`card-prio-tag prio-${prio}`}>{prio}</span>
                          <h3 className="card-task-title">{t.title}</h3>
                          <div className="card-task-note">Note: {note}</div>

                          <div className="card-progress-section">
                            <div className="card-progress-labels">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="card-progress-track">
                              <div className="card-progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>

                          <div className="card-footer-row">
                            <div className="card-assignees">
                              <img src={getAvatarUrl(t.assignee || t.id)} className="card-assignee-avatar" alt={t.assignee} />
                              {t.assignee && t.assignee.includes('&') && (
                                <img src={getAvatarUrl(t.assignee + '_team')} className="card-assignee-avatar" alt="Team" />
                              )}
                            </div>

                            <div className="card-meta-counts">
                              <span className="card-count-item" title="Attachments">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                </svg>
                                {attachCount}
                              </span>
                              <span className="card-count-item" title="Comments">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                                </svg>
                                {commentCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentView === 'list' && (
          <div className="view-panel">
            <div className="table-card">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Platform</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Mandays</th>
                    <th>Stage</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id} onClick={() => setEditingTask(t)} style={{ cursor: 'pointer' }}>
                      <td><strong>{t.title}</strong></td>
                      <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>{t.platform || 'General'}</span></td>
                      <td>{t.assignee || 'Unassigned'}</td>
                      <td><span className={`card-prio-tag prio-${t.priority || 'Medium'}`}>{t.priority || 'Medium'}</span></td>
                      <td><strong>{t.mandays || 5} MD</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>{(t.stage || 'todo').replace('-', ' ')}</td>
                      <td>{t.progress || 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'overview' && (
          <div className="view-panel">
            <div className="overview-kpis">
              <div className="kpi-card">
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>TOTAL TASKS</div>
                <div className="kpi-num">{tasks.length}</div>
                <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Connected to SQLite DB</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>SPRINT VELOCITY</div>
                <div className="kpi-num">
                  {Math.round(tasks.reduce((acc, t) => acc + (parseFloat(t.mandays) || 0), 0))} MD
                </div>
                <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Estimated Workload</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>COMPLETION RATE</div>
                <div className="kpi-num">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.stage === 'completed').length / tasks.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: 12, color: '#178a70', fontWeight: 600 }}>Completed Tasks</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>ACTIVE TASKS</div>
                <div className="kpi-num">
                  {tasks.filter(t => t.stage === 'in-progress' || t.stage === 'review').length}
                </div>
                <div style={{ fontSize: 12, color: '#e67d22', fontWeight: 600 }}>Under Development</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="view-panel">
            <div className="kpi-card">
              <h3 style={{ marginBottom: 14 }}>Sprint Milestones & Timeline</h3>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
                All milestone schedules and release deliverables are managed in <strong>database.sqlite</strong>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Edit Task Details</h2>
              <button className="modal-close-icon" onClick={() => setEditingTask(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-form-content">
                <div className="form-group-field">
                  <label>Task Title</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={editingTask.title || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Platform</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingTask.platform || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, platform: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Assignee</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingTask.assignee || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Stage</label>
                    <select
                      className="form-input-field"
                      value={editingTask.stage || 'todo'}
                      onChange={(e) => setEditingTask({ ...editingTask, stage: e.target.value })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group-field">
                    <label>Priority</label>
                    <select
                      className="form-input-field"
                      value={editingTask.priority || 'Medium'}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Progress: {editingTask.progress || 0}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="form-input-field"
                      value={editingTask.progress || 0}
                      onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Mandays (MD)</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={editingTask.mandays || '5'}
                      onChange={(e) => setEditingTask({ ...editingTask, mandays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label>Note / Description</label>
                  <textarea
                    className="form-input-field"
                    rows="3"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="pill-action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteTask(editingTask.id)}>
                  Delete
                </button>
                <button type="submit" className="btn-add-task-yellow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add New Task</h2>
              <button className="modal-close-icon" onClick={() => setIsAddOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-form-content">
                <div className="form-group-field">
                  <label>Task Title *</label>
                  <input type="text" name="addTitle" className="form-input-field" placeholder="e.g. Design Notification Banner" required />
                </div>
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Platform</label>
                    <input type="text" name="addPlatform" className="form-input-field" placeholder="e.g. AYO Toko" />
                  </div>
                  <div className="form-group-field">
                    <label>Assignee</label>
                    <input type="text" name="addAssignee" className="form-input-field" placeholder="e.g. John Doe" />
                  </div>
                </div>
                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label>Initial Stage</label>
                    <select name="addStage" className="form-input-field">
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group-field">
                    <label>Priority</label>
                    <select name="addPriority" className="form-input-field" defaultValue="Medium">
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-field">
                  <label>Note / Description</label>
                  <textarea name="addNote" className="form-input-field" rows="2" placeholder="e.g. Ensure it adapts well in both light and dark themes."></textarea>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="pill-action-btn" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn-add-task-yellow">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div className="toast-shelf">
          <div className="toast-bubble">{toast}</div>
        </div>
      )}
    </div>
  );
}
