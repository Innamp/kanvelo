/**
 * NovaBoard - Interactive Task Management System
 * Backed by SQLite (database.sqlite via api.php) with offline/GitHub Pages fallback
 */

const STATE = {
  tasks: [],
  currentSprint: 'sprint-10',
  currentView: 'board',
  filter: {
    search: '',
    sort: 'stage'
  },
  useApi: true
};

const DEMO_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop'
];

function getAvatarUrl(seed) {
  let hash = 0;
  for (let i = 0; i < (seed || '').length; i++) {
    hash = (seed || '').charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEMO_AVATARS[Math.abs(hash) % DEMO_AVATARS.length];
}

function showToast(msg) {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;
  const bubble = document.createElement('div');
  bubble.className = 'toast-bubble';
  bubble.textContent = msg;
  shelf.appendChild(bubble);
  setTimeout(() => {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(8px)';
    setTimeout(() => bubble.remove(), 250);
  }, 2200);
}

// 1. Fetch Tasks (SQLite API with static fallback)
async function loadTasks() {
  try {
    const res = await fetch(`api.php?action=get_tasks&sprint_id=${STATE.currentSprint}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.tasks) {
        STATE.tasks = data.tasks;
        STATE.useApi = true;
        renderAll();
        return;
      }
    }
  } catch (e) {
    console.warn('API unavailable, falling back to static/local storage', e);
  }

  // Fallback for static GitHub Pages or direct file viewing
  STATE.useApi = false;
  const local = localStorage.getItem('novaboard_tasks_' + STATE.currentSprint);
  if (local) {
    STATE.tasks = JSON.parse(local);
  } else {
    try {
      const jsonRes = await fetch('tasks_data.json');
      if (jsonRes.ok) {
        const full = await jsonRes.json();
        const sprintData = full[STATE.currentSprint] || full['sprint-10'];
        STATE.tasks = sprintData.tasks || [];
      }
    } catch (err) {
      console.error('Failed to load tasks_data.json fallback', err);
    }
  }
  renderAll();
}

function saveLocalFallback() {
  if (!STATE.useApi) {
    localStorage.setItem('novaboard_tasks_' + STATE.currentSprint, JSON.stringify(STATE.tasks));
  }
}

// 2. Render Functions
function getFilteredTasks() {
  let list = [...STATE.tasks];
  const q = STATE.filter.search.toLowerCase().trim();

  if (q) {
    list = list.filter(t => 
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.platform && t.platform.toLowerCase().includes(q)) ||
      (t.assignee && t.assignee.toLowerCase().includes(q))
    );
  }

  if (STATE.filter.sort === 'priority') {
    const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
    list.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
  } else if (STATE.filter.sort === 'mandays') {
    list.sort((a, b) => parseFloat(b.mandays || 0) - parseFloat(a.mandays || 0));
  } else if (STATE.filter.sort === 'title') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  return list;
}

function renderBoard() {
  const tasks = getFilteredTasks();
  const stacks = {
    'todo': document.getElementById('stackTodo'),
    'in-progress': document.getElementById('stackInProgress'),
    'review': document.getElementById('stackReview'),
    'completed': document.getElementById('stackCompleted')
  };

  Object.values(stacks).forEach(s => { if (s) s.innerHTML = ''; });

  tasks.forEach(t => {
    const stage = t.stage || 'todo';
    const stack = stacks[stage] || stacks['todo'];
    if (stack) {
      stack.appendChild(createCardElement(t));
    }
  });
}

function createCardElement(t) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = t.id;

  const progress = t.progress !== undefined ? t.progress : (t.stage === 'completed' ? 100 : (t.stage === 'in-progress' ? 60 : 0));
  const prio = t.priority || 'Medium';
  const avatarImg = getAvatarUrl(t.assignee || t.id);
  const note = t.description || t.background || 'Ensure all acceptance criteria are met.';
  const attachCount = t.attachments_count !== undefined ? t.attachments_count : (t.attachmentsCount || (t.title.length % 3));
  const commentCount = t.comments_count !== undefined ? t.comments_count : (t.commentsCount || ((t.title.length % 5) + 1));

  card.innerHTML = `
    <span class="card-prio-tag prio-${prio}">${prio}</span>
    <h3 class="card-task-title">${escapeHTML(t.title)}</h3>
    <div class="card-task-note">Note: ${escapeHTML(note)}</div>
    
    <div class="card-progress-section">
      <div class="card-progress-labels">
        <span>Progress</span>
        <span>${progress}%</span>
      </div>
      <div class="card-progress-track">
        <div class="card-progress-bar" style="width: ${progress}%;"></div>
      </div>
    </div>

    <div class="card-footer-row">
      <div class="card-assignees">
        <img src="${avatarImg}" class="card-assignee-avatar" alt="${escapeHTML(t.assignee || 'User')}">
        ${t.assignee && t.assignee.includes('&') ? `<img src="${getAvatarUrl(t.assignee + '_2')}" class="card-assignee-avatar" alt="Team">` : ''}
      </div>

      <div class="card-meta-counts">
        <span class="card-count-item" title="Attachments">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          ${attachCount}
        </span>
        <span class="card-count-item" title="Comments">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          ${commentCount}
        </span>
      </div>
    </div>
  `;

  // HTML5 Drag Events
  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', t.id);
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  // Open modal on click
  card.addEventListener('click', () => {
    openEditModal(t);
  });

  return card;
}

function renderList() {
  const tbody = document.getElementById('listTableContent');
  if (!tbody) return;
  tbody.innerHTML = '';

  const tasks = getFilteredTasks();
  tasks.forEach(t => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td><strong>${escapeHTML(t.title)}</strong></td>
      <td><span style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-size:11.5px; font-weight:600;">${escapeHTML(t.platform || 'General')}</span></td>
      <td>${escapeHTML(t.assignee || 'Unassigned')}</td>
      <td><span class="card-prio-tag prio-${t.priority || 'Medium'}">${t.priority || 'Medium'}</span></td>
      <td><strong>${t.mandays || 3} MD</strong></td>
      <td style="text-transform: capitalize;">${(t.stage || 'todo').replace('-', ' ')}</td>
      <td>${t.progress || 0}%</td>
    `;
    tr.addEventListener('click', () => openEditModal(t));
    tbody.appendChild(tr);
  });
}

function renderOverview() {
  const tasks = STATE.tasks;
  const total = tasks.length;
  let mandays = 0;
  let completed = 0;
  let active = 0;

  tasks.forEach(t => {
    mandays += parseFloat(t.mandays || 0) || 0;
    if (t.stage === 'completed') completed++;
    if (t.stage === 'in-progress' || t.stage === 'review') active++;
  });

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiMandays').textContent = Math.round(mandays) + ' MD';
  document.getElementById('kpiCompletion').textContent = completionPct + '%';
  document.getElementById('kpiActive').textContent = active;
}

function renderAll() {
  if (STATE.currentView === 'board') renderBoard();
  else if (STATE.currentView === 'list') renderList();
  else if (STATE.currentView === 'overview') renderOverview();
}

// 3. Stage Updates (Move Cards via Drag-and-Drop)
async function updateTaskStage(taskId, newStage) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.stage = newStage;
  if (newStage === 'completed') task.progress = 100;
  else if (newStage === 'todo') task.progress = 0;
  else if (newStage === 'in-progress' && (!task.progress || task.progress === 0)) task.progress = 60;

  if (STATE.useApi) {
    try {
      await fetch('api.php?action=update_stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, stage: newStage, progress: task.progress })
      });
    } catch (e) {
      console.warn('Failed to update stage via API', e);
    }
  } else {
    saveLocalFallback();
  }

  renderAll();
  showToast(`Moved to ${newStage.replace('-', ' ')}`);
}

// 4. Modal Handlers
function openEditModal(task) {
  document.getElementById('editId').value = task.id;
  document.getElementById('fTitle').value = task.title || '';
  document.getElementById('fPlatform').value = task.platform || '';
  document.getElementById('fAssignee').value = task.assignee || '';
  document.getElementById('fStage').value = task.stage || 'todo';
  document.getElementById('fPriority').value = task.priority || 'Medium';
  document.getElementById('fProgress').value = task.progress || 0;
  document.getElementById('fProgressText').textContent = `${task.progress || 0}%`;
  document.getElementById('fMandays').value = task.mandays || '5';
  document.getElementById('fNote').value = task.description || task.background || '';
  document.getElementById('modalTaskTitle').textContent = task.title || 'Task Details';

  document.getElementById('modalEdit').showModal();
}

// 5. Event Listeners
function setupEvents() {
  // Navigation Tabs
  document.querySelectorAll('.view-tabs-bar .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-tabs-bar .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      STATE.currentView = view;

      document.getElementById('viewBoard').style.display = view === 'board' ? 'grid' : 'none';
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

      if (view === 'list') document.getElementById('viewList').classList.add('active');
      else if (view === 'overview') document.getElementById('viewOverview').classList.add('active');
      else if (view === 'calendar') document.getElementById('viewCalendar').classList.add('active');

      renderAll();
    });
  });

  // Sidebar Nav
  document.querySelectorAll('.sidebar-nav .nav-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) {
        const corresponding = document.querySelector(`.view-tabs-bar .tab-btn[data-view="${targetTab}"]`);
        if (corresponding) corresponding.click();
      }
    });
  });

  // Drag and Drop Columns
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStage = col.dataset.stage;
      if (taskId && targetStage) {
        updateTaskStage(taskId, targetStage);
      }
    });
  });

  // Search
  const globalSearch = document.getElementById('globalSearch');
  const boardSearch = document.getElementById('boardSearch');
  function doSearch(val) {
    STATE.filter.search = val;
    if (globalSearch && globalSearch.value !== val) globalSearch.value = val;
    if (boardSearch && boardSearch.value !== val) boardSearch.value = val;
    renderAll();
  }
  if (globalSearch) globalSearch.addEventListener('input', e => doSearch(e.target.value));
  if (boardSearch) boardSearch.addEventListener('input', e => doSearch(e.target.value));

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    STATE.filter.sort = e.target.value;
    renderAll();
  });

  // Sprint Selector
  document.getElementById('sprintSelect').addEventListener('change', e => {
    STATE.currentSprint = e.target.value;
    loadTasks();
    showToast(`Loaded ${e.target.value} from SQLite`);
  });

  // Progress range in Edit modal
  const fProgress = document.getElementById('fProgress');
  const fProgressText = document.getElementById('fProgressText');
  fProgress.addEventListener('input', () => {
    fProgressText.textContent = `${fProgress.value}%`;
  });

  // Close modals
  document.getElementById('btnCloseEdit').addEventListener('click', () => document.getElementById('modalEdit').close());
  document.getElementById('btnCloseAdd').addEventListener('click', () => document.getElementById('modalAdd').close());
  document.getElementById('btnCancelAdd').addEventListener('click', () => document.getElementById('modalAdd').close());

  // Open Add Task Modal
  document.getElementById('btnAddNewTask').addEventListener('click', () => {
    document.getElementById('formAdd').reset();
    document.getElementById('modalAdd').showModal();
  });

  // Submit Edit Task
  document.getElementById('formEdit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const task = STATE.tasks.find(t => t.id === id);
    if (!task) return;

    task.title = document.getElementById('fTitle').value;
    task.platform = document.getElementById('fPlatform').value;
    task.assignee = document.getElementById('fAssignee').value;
    task.stage = document.getElementById('fStage').value;
    task.priority = document.getElementById('fPriority').value;
    task.progress = parseInt(document.getElementById('fProgress').value, 10);
    task.mandays = document.getElementById('fMandays').value;
    task.description = document.getElementById('fNote').value;

    if (STATE.useApi) {
      await fetch('api.php?action=save_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          sprint_id: STATE.currentSprint,
          title: task.title,
          platform: task.platform,
          assignee: task.assignee,
          stage: task.stage,
          priority: task.priority,
          progress: task.progress,
          mandays: task.mandays,
          description: task.description
        })
      });
    } else {
      saveLocalFallback();
    }

    document.getElementById('modalEdit').close();
    renderAll();
    showToast('Saved to SQLite database!');
  });

  // Delete Task
  document.getElementById('btnDelete').addEventListener('click', async () => {
    const id = document.getElementById('editId').value;
    if (!confirm('Are you sure you want to delete this task?')) return;

    STATE.tasks = STATE.tasks.filter(t => t.id !== id);

    if (STATE.useApi) {
      await fetch('api.php?action=delete_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } else {
      saveLocalFallback();
    }

    document.getElementById('modalEdit').close();
    renderAll();
    showToast('Task deleted from SQLite');
  });

  // Create Task
  document.getElementById('formAdd').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newId = STATE.currentSprint + '-t' + Date.now();
    const newTask = {
      id: newId,
      sprint_id: STATE.currentSprint,
      title: document.getElementById('addTitle').value,
      platform: document.getElementById('addPlatform').value || 'General',
      assignee: document.getElementById('addAssignee').value || 'Unassigned',
      stage: document.getElementById('addStage').value,
      priority: document.getElementById('addPriority').value,
      description: document.getElementById('addNote').value,
      progress: document.getElementById('addStage').value === 'completed' ? 100 : 0,
      mandays: '5',
      attachments_count: 0,
      comments_count: 1
    };

    STATE.tasks.unshift(newTask);

    if (STATE.useApi) {
      await fetch('api.php?action=save_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } else {
      saveLocalFallback();
    }

    document.getElementById('modalAdd').close();
    renderAll();
    showToast('New task created in SQLite!');
  });

  // Keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'k')) {
      e.preventDefault();
      globalSearch?.focus();
    }
  });

  // Share
  document.getElementById('btnShareApp').addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('App link copied to clipboard!');
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  loadTasks();
});
