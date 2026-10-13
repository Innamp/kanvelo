import React, { useState, useMemo } from 'react';
import { LIFECYCLE_STAGES } from '../../../constants/sprintConstants';
import { PRIORITIES } from '../../../constants';
import { splitMultiValue } from '../../../utils/taskHelpers';
import { useSprint } from '../../../context/SprintContext';
import { useAuth } from '../../../context/AuthContext';
import { saveSprintTasks } from '../../../services/sprintTaskAdapter';

export function SprintKanbanTab({ sprint, tasks, onTaskClick }) {
  const { refreshTasks } = useSprint();
  const { currentUser, canManipulateTasks } = useAuth();

  // Kanban filters
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterPM, setFilterPM] = useState('all');
  const [filterPIC, setFilterPIC] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [search, setSearch] = useState('');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Dynamic filter dropdown options
  const filterOptions = useMemo(() => {
    const platforms = new Set();
    const pms = new Set();
    const pics = new Set();

    tasks.forEach(t => {
      splitMultiValue(t.platforms || t.platform).forEach(p => p && platforms.add(p));
      splitMultiValue(t.product_managers || t.product_manager).forEach(pm => pm && pms.add(pm));
      splitMultiValue(t.assignees || t.assignee).forEach(pic => pic && pics.add(pic));
    });

    return {
      platforms: Array.from(platforms).sort(),
      pms: Array.from(pms).sort(),
      pics: Array.from(pics).sort()
    };
  }, [tasks]);

  // Normalize ticket lifecycle stage into one of the 11 columns
  const getStageKeyForTask = (t) => {
    const raw = (t.lifecycle_stage || t.ticket_status || t.stage || '').toLowerCase().trim();
    if (raw.includes('propos') || raw.includes('todo')) return 'proposed';
    if (raw.includes('brd')) return 'brd-assessment';
    if (raw.includes('plan')) return 'ready-planning';
    if (raw.includes('dev') || raw.includes('progress')) return 'development';
    if (raw.includes('review') || raw.includes('pr')) return 'code-review';
    if (raw.includes('uat')) return 'uat';
    if (raw.includes('ready to deploy') || raw.includes('ready-deploy')) return 'ready-deploy';
    if (raw.includes('deploy') || raw.includes('done') || raw.includes('completed')) return 'deployed';
    if (raw.includes('carry') || raw.includes('move')) return 'carry-over';
    if (raw.includes('deprio') || raw.includes('postpone')) return 'deprioritized';
    if (raw.includes('cancel')) return 'cancelled';
    return 'proposed';
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const mTitle = (t.title || '').toLowerCase().includes(q);
        const mCode = (t.ticket_code || t.code || '').toLowerCase().includes(q);
        if (!mTitle && !mCode) return false;
      }

      if (filterPlatform !== 'all') {
        const pList = splitMultiValue(t.platforms || t.platform);
        if (!pList.includes(filterPlatform)) return false;
      }

      if (filterPM !== 'all') {
        const pmList = splitMultiValue(t.product_managers || t.product_manager);
        if (!pmList.includes(filterPM)) return false;
      }

      if (filterPIC !== 'all') {
        const picList = splitMultiValue(t.assignees || t.assignee);
        if (!picList.includes(filterPIC)) return false;
      }

      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

      if (filterDate !== 'all') {
        const deployDate = t.expected_deployment_date || t.deployment_date || '';
        if (!deployDate.includes(filterDate)) return false;
      }

      return true;
    });
  }, [tasks, search, filterPlatform, filterPM, filterPIC, filterPriority, filterDate]);

  // Group into 11 columns
  const columnBuckets = useMemo(() => {
    const map = {};
    LIFECYCLE_STAGES.forEach(col => {
      map[col.key] = [];
    });

    filteredTasks.forEach(task => {
      const colKey = getStageKeyForTask(task);
      if (map[colKey]) {
        map[colKey].push(task);
      } else {
        map['proposed'].push(task);
      }
    });

    return map;
  }, [filteredTasks]);

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    if (!canManipulateTasks) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault();
    if (!canManipulateTasks || !draggedTaskId) return;

    const taskToMove = tasks.find(t => t.id === draggedTaskId);
    if (!taskToMove) return;

    const currentKey = getStageKeyForTask(taskToMove);
    if (currentKey === targetColumnKey) {
      setDraggedTaskId(null);
      return;
    }

    // Find column display title
    const colDef = LIFECYCLE_STAGES.find(c => c.key === targetColumnKey);
    const newStageTitle = colDef ? colDef.title : targetColumnKey;

    // Movement history entry
    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Moved from ${currentKey} to ${newStageTitle}`,
      user: currentUser?.name || 'Inna MP',
      sprint: sprint.name,
      stage: newStageTitle
    };

    const updatedTasks = tasks.map(t => {
      if (t.id === draggedTaskId) {
        return {
          ...t,
          lifecycle_stage: targetColumnKey,
          ticket_status: newStageTitle,
          stage: targetColumnKey === 'deployed' ? 'completed' :
            targetColumnKey === 'development' ? 'in-progress' :
              targetColumnKey === 'code-review' || targetColumnKey === 'uat' ? 'review' : 'todo',
          sprint_history: [...(t.sprint_history || []), historyEntry]
        };
      }
      return t;
    });

    saveSprintTasks(sprint.id, updatedTasks);
    refreshTasks();
    setDraggedTaskId(null);
  };

  return (
    <div className="sprint-kanban-tab animate-fade-in">
      {/* Kanban Filters Strip */}
      <div className="kanban-filter-header card-styled">
        <div className="kanban-filters-row">
          <input
            type="text"
            placeholder="Search in Kanban..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="filter-select-input search-input"
          />

          <div className="kanban-filter-group">
            <label>Platform:</label>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="kanban-filter-group">
            <label>PM:</label>
            <select value={filterPM} onChange={e => setFilterPM(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.pms.map(pm => <option key={pm} value={pm}>{pm}</option>)}
            </select>
          </div>

          <div className="kanban-filter-group">
            <label>PIC:</label>
            <select value={filterPIC} onChange={e => setFilterPIC(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.pics.map(pic => <option key={pic} value={pic}>{pic}</option>)}
            </select>
          </div>

          <div className="kanban-filter-group">
            <label>Priority:</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {Object.values(PRIORITIES).map(pr => <option key={pr} value={pr}>{pr}</option>)}
            </select>
          </div>

          <button
            className="btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setFilterPlatform('all');
              setFilterPM('all');
              setFilterPIC('all');
              setFilterPriority('all');
              setFilterDate('all');
            }}
          >
            Reset
          </button>
        </div>

        <div className="kanban-subtext-bar">
          <span className="text-muted">
            11 Lifecycle Stages • Drag and drop cards to update status and record movement history
          </span>
          <span className="kanban-total-counter">
            Showing {filteredTasks.length} cards in {sprint.name}
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable 11-Column Board */}
      <div className="sprint-kanban-board-scroll">
        <div className="sprint-kanban-columns-container">
          {LIFECYCLE_STAGES.map(column => {
            const columnTasks = columnBuckets[column.key] || [];

            return (
              <div
                key={column.key}
                className="sprint-kanban-col"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, column.key)}
              >
                {/* Column Header */}
                <div className="kanban-col-head" style={{ borderTop: `3px solid ${column.color}` }}>
                  <div className="col-title-wrap">
                    <span className="col-status-dot" style={{ backgroundColor: column.color }}></span>
                    <h4 className="col-title-text">{column.title}</h4>
                  </div>
                  <span className="col-count-pill">{columnTasks.length}</span>
                </div>

                {/* Column Cards List */}
                <div className="kanban-cards-stack">
                  {columnTasks.length === 0 ? (
                    <div className="kanban-empty-drop-zone">
                      <span>No tickets</span>
                    </div>
                  ) : (
                    columnTasks.map(task => {
                      const isCarry = task.carry_over === 'Yes' || task.is_carry_over;
                      const priorityClass = `priority-${(task.priority || 'Medium').toLowerCase()}`;

                      return (
                        <div
                          key={task.id}
                          className="kanban-card-item card-styled"
                          draggable={canManipulateTasks}
                          onDragStart={e => handleDragStart(e, task.id)}
                          onClick={() => onTaskClick(task)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="card-top-row">
                            <span className="card-code-tag">{task.ticket_code || task.code || 'S-TKT'}</span>
                            <span className={`priority-indicator-dot ${priorityClass}`} title={`Priority: ${task.priority}`}></span>
                          </div>

                          <h5 className="card-task-title">{task.title}</h5>

                          <div className="card-meta-chips">
                            <span className="card-platform-chip">
                              {task.platforms || task.platform || 'General'}
                            </span>
                            {isCarry && (
                              <span className="card-carry-chip">🔁 Carry Over</span>
                            )}
                          </div>

                          <div className="card-footer-strip">
                            <span className="card-assignee-text">
                              👤 {task.assignees || task.assignee || 'Unassigned'}
                            </span>
                            <span className="card-mandays-pill">
                              {task.mandays || 1} MD
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
