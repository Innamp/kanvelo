import React, { useState, useMemo } from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { Avatar } from '../common/Avatar';
import { PRIORITIES, STAGES } from '../../constants';
import { splitMultiValue } from '../../utils/taskHelpers';

export function ListView({ tasks, onTaskClick }) {
  const [filters, setFilters] = useState({
    title: '',
    platform: '',
    assignee: '',
    priority: '',
    mandays: '',
    stage: '',
    progress: ''
  });

  // Extract unique platforms and assignees for dropdowns
  const { uniquePlatforms, uniqueAssignees } = useMemo(() => {
    const platforms = new Set();
    const assignees = new Set();

    tasks.forEach(t => {
      splitMultiValue(t.platforms || t.platform).forEach(p => platforms.add(p));
      splitMultiValue(t.assignees || t.assignee).forEach(a => assignees.add(a));
    });

    return {
      uniquePlatforms: Array.from(platforms).sort(),
      uniqueAssignees: Array.from(assignees).sort()
    };
  }, [tasks]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      title: '',
      platform: '',
      assignee: '',
      priority: '',
      mandays: '',
      stage: '',
      progress: ''
    });
  };

  const isFiltered = Object.values(filters).some(Boolean);

  // Apply column filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Title Filter
      if (filters.title) {
        const titleMatch = (task.title || '').toLowerCase().includes(filters.title.toLowerCase().trim());
        if (!titleMatch) return false;
      }

      // 2. Platform Filter
      if (filters.platform) {
        const pList = splitMultiValue(task.platforms || task.platform);
        const match = pList.some(p => p.toLowerCase() === filters.platform.toLowerCase());
        if (!match) return false;
      }

      // 3. Assignee Filter
      if (filters.assignee) {
        const aList = splitMultiValue(task.assignees || task.assignee);
        const match = aList.some(a => a.toLowerCase().includes(filters.assignee.toLowerCase()));
        if (!match) return false;
      }

      // 4. Priority Filter
      if (filters.priority) {
        if ((task.priority || 'Medium') !== filters.priority) return false;
      }

      // 5. Mandays Filter
      if (filters.mandays) {
        const mdStr = String(task.mandays || '');
        if (!mdStr.includes(filters.mandays.trim())) return false;
      }

      // 6. Stage Filter
      if (filters.stage) {
        if ((task.stage || 'todo') !== filters.stage) return false;
      }

      // 7. Progress Filter
      if (filters.progress) {
        const prog = Number(task.progress) || 0;
        if (filters.progress === '0' && prog !== 0) return false;
        if (filters.progress === '1-49' && (prog < 1 || prog > 49)) return false;
        if (filters.progress === '50-99' && (prog < 50 || prog > 99)) return false;
        if (filters.progress === '100' && prog !== 100) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return (
    <div className="view-panel list-view-panel">
      <div className="table-card">
        {/* Table Toolbar / Counter */}
        <div className="table-top-toolbar">
          <div className="table-count-info">
            Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
            {isFiltered && (
              <span className="filter-active-pill">Filters active</span>
            )}
          </div>
          {isFiltered && (
            <button
              className="btn-clear-table-filters"
              onClick={handleResetFilters}
              type="button"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Scrollable Table with Frozen Headers */}
        <div className="table-scroll-wrapper">
          <table className="tasks-table">
            <thead>
              {/* Row 1: Column Titles */}
              <tr className="header-row">
                <th className="col-header-cell col-title">TASK TITLE</th>
                <th className="col-header-cell col-platform">PLATFORM</th>
                <th className="col-header-cell col-assignee">ASSIGNEE</th>
                <th className="col-header-cell col-priority">PRIORITY</th>
                <th className="col-header-cell col-mandays">MANDAYS</th>
                <th className="col-header-cell col-stage">STAGE</th>
                <th className="col-header-cell col-progress">PROGRESS</th>
              </tr>

              {/* Row 2: Frozen Column Filter Row */}
              <tr className="filter-row">
                {/* Title Filter */}
                <th className="col-filter-cell col-title">
                  <input
                    type="text"
                    className="col-filter-input"
                    placeholder="Search title..."
                    value={filters.title}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
                    aria-label="Filter by title"
                  />
                </th>

                {/* Platform Filter */}
                <th className="col-filter-cell col-platform">
                  <select
                    className="col-filter-select"
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                    aria-label="Filter by platform"
                  >
                    <option value="">All Platforms</option>
                    {uniquePlatforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </th>

                {/* Assignee Filter */}
                <th className="col-filter-cell col-assignee">
                  <select
                    className="col-filter-select"
                    value={filters.assignee}
                    onChange={(e) => handleFilterChange('assignee', e.target.value)}
                    aria-label="Filter by assignee"
                  >
                    <option value="">All Assignees</option>
                    {uniqueAssignees.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </th>

                {/* Priority Filter */}
                <th className="col-filter-cell col-priority">
                  <select
                    className="col-filter-select"
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    aria-label="Filter by priority"
                  >
                    <option value="">All</option>
                    <option value={PRIORITIES.HIGH}>High</option>
                    <option value={PRIORITIES.MEDIUM}>Medium</option>
                    <option value={PRIORITIES.LOW}>Low</option>
                  </select>
                </th>

                {/* Mandays Filter */}
                <th className="col-filter-cell col-mandays">
                  <input
                    type="text"
                    className="col-filter-input"
                    placeholder="Filter MD..."
                    value={filters.mandays}
                    onChange={(e) => handleFilterChange('mandays', e.target.value)}
                    aria-label="Filter by mandays"
                  />
                </th>

                {/* Stage Filter */}
                <th className="col-filter-cell col-stage">
                  <select
                    className="col-filter-select"
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                    aria-label="Filter by stage"
                  >
                    <option value="">All Stages</option>
                    <option value={STAGES.TODO}>To Do</option>
                    <option value={STAGES.IN_PROGRESS}>In Progress</option>
                    <option value={STAGES.REVIEW}>In Review</option>
                    <option value={STAGES.COMPLETED}>Completed</option>
                  </select>
                </th>

                {/* Progress Filter */}
                <th className="col-filter-cell col-progress">
                  <select
                    className="col-filter-select"
                    value={filters.progress}
                    onChange={(e) => handleFilterChange('progress', e.target.value)}
                    aria-label="Filter by progress"
                  >
                    <option value="">All</option>
                    <option value="0">0%</option>
                    <option value="1-49">1% - 49%</option>
                    <option value="50-99">50% - 99%</option>
                    <option value="100">100%</option>
                  </select>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty-cell">
                    <div className="table-empty-wrap">
                      <p>No tasks match the active column filters.</p>
                      {isFiltered && (
                        <button
                          className="btn-clear-table-filters"
                          onClick={handleResetFilters}
                          type="button"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="table-task-row"
                    tabIndex={0}
                  >
                    <td className="cell-title">
                      <strong>{task.title}</strong>
                    </td>
                    <td className="cell-platform">
                      <div className="cell-platform-stack">
                        {(() => {
                          const pList = splitMultiValue(task.platforms || task.platform);
                          if (pList.length === 0) {
                            return <span className="platform-tag-pill">General</span>;
                          }
                          return pList.map((p, idx) => (
                            <span key={idx} className="platform-tag-pill" title={`Platform: ${p}`}>
                              {p}
                            </span>
                          ));
                        })()}
                      </div>
                    </td>
                    <td className="cell-assignee">
                      <div className="cell-assignee-stack">
                        {(() => {
                          const aList = splitMultiValue(task.assignees || task.assignee);
                          if (aList.length === 0) {
                            return <span className="assignee-empty-text">Unassigned</span>;
                          }
                          return aList.map((a, idx) => (
                            <div key={idx} className="assignee-row-chip" title={`Assignee: ${a}`}>
                              <Avatar name={a} size={20} />
                              <span className="assignee-name-text">{a}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </td>
                    <td className="cell-priority">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="cell-mandays">
                      <strong>{task.mandays || 5} MD</strong>
                    </td>
                    <td className="cell-stage">
                      <span className={`stage-text-tag ${(task.stage || 'todo')}`}>
                        {(task.stage || 'todo').replace('-', ' ')}
                      </span>
                    </td>
                    <td className="cell-progress">
                      <div className="table-progress-box">
                        <span>{task.progress || 0}%</span>
                        <div className="table-mini-bar-track">
                          <div
                            className="table-mini-bar-fill"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
