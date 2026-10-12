import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { Avatar } from '../common/Avatar';
import { PRIORITIES, STAGES } from '../../constants';
import { splitMultiValue } from '../../utils/taskHelpers';
import {
  SPRINT_ALL_COLUMNS,
  SPRINT_COLUMN_CATEGORIES,
  COLUMN_PRESETS
} from '../../constants/sprintColumns';

export function ListView({ tasks, onTaskClick }) {
  // Store visible column keys
  const [visibleColKeys, setVisibleColKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('kanvelo_list_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return COLUMN_PRESETS.DEFAULT.keys;
  });

  // State for Column Customizer modal/popover
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const pickerRef = useRef(null);

  // Filter state for each column
  const [filters, setFilters] = useState({});

  // Close column picker on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    }
    if (showColumnPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnPicker]);

  // Persist column selections
  const handleToggleColumn = (colKey) => {
    setVisibleColKeys(prev => {
      let updated;
      if (prev.includes(colKey)) {
        // Prevent hiding the last column
        if (prev.length <= 1) return prev;
        updated = prev.filter(k => k !== colKey);
      } else {
        updated = [...prev, colKey];
      }
      try {
        localStorage.setItem('kanvelo_list_visible_columns', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleApplyPreset = (preset) => {
    setVisibleColKeys(preset.keys);
    try {
      localStorage.setItem('kanvelo_list_visible_columns', JSON.stringify(preset.keys));
    } catch (e) {}
  };

  const handleSelectAllColumns = () => {
    const allKeys = SPRINT_ALL_COLUMNS.map(c => c.key);
    setVisibleColKeys(allKeys);
    try {
      localStorage.setItem('kanvelo_list_visible_columns', JSON.stringify(allKeys));
    } catch (e) {}
  };

  const handleResetDefaultColumns = () => {
    handleApplyPreset(COLUMN_PRESETS.DEFAULT);
  };

  // Visible column definitions in original order
  const activeColumns = useMemo(() => {
    return SPRINT_ALL_COLUMNS.filter(col => visibleColKeys.includes(col.key));
  }, [visibleColKeys]);

  // Unique values for specific dropdown filters
  const { uniquePlatforms, uniqueAssignees, uniqueDevStatuses, uniqueCategories } = useMemo(() => {
    const platforms = new Set();
    const assignees = new Set();
    const devStatuses = new Set();
    const categories = new Set();

    tasks.forEach(t => {
      splitMultiValue(t.platforms || t.platform).forEach(p => p && platforms.add(p));
      splitMultiValue(t.assignees || t.assignee).forEach(a => a && assignees.add(a));
      if (t.final_dev_status) devStatuses.add(t.final_dev_status);
      if (t.category) categories.add(t.category);
    });

    return {
      uniquePlatforms: Array.from(platforms).sort(),
      uniqueAssignees: Array.from(assignees).sort(),
      uniqueDevStatuses: Array.from(devStatuses).sort(),
      uniqueCategories: Array.from(categories).sort()
    };
  }, [tasks]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const isFiltered = useMemo(() => {
    return Object.values(filters).some(val => val !== undefined && val !== '');
  }, [filters]);

  // Apply filters across all columns
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      for (const [key, filterVal] of Object.entries(filters)) {
        if (!filterVal || filterVal.trim() === '') continue;
        const searchLower = filterVal.toLowerCase().trim();

        if (key === 'title') {
          const title = (task.title || task.epic || '').toLowerCase();
          if (!title.includes(searchLower)) return false;
        } else if (key === 'platform') {
          const pList = splitMultiValue(task.platforms || task.platform);
          if (!pList.some(p => p.toLowerCase().includes(searchLower))) return false;
        } else if (key === 'assignee') {
          const aList = splitMultiValue(task.assignees || task.assignee);
          if (!aList.some(a => a.toLowerCase().includes(searchLower))) return false;
        } else if (key === 'priority') {
          if ((task.priority || 'Medium').toLowerCase() !== searchLower) return false;
        } else if (key === 'stage') {
          if ((task.stage || 'todo').toLowerCase() !== searchLower) return false;
        } else if (key === 'progress') {
          const prog = Number(task.progress) || 0;
          if (searchLower === '0' && prog !== 0) return false;
          if (searchLower === '1-49' && (prog < 1 || prog > 49)) return false;
          if (searchLower === '50-99' && (prog < 50 || prog > 99)) return false;
          if (searchLower === '100' && prog !== 100) return false;
        } else {
          const taskVal = String(task[key] || '').toLowerCase();
          if (!taskVal.includes(searchLower)) return false;
        }
      }
      return true;
    });
  }, [tasks, filters]);

  // Grouped columns for the Column Picker
  const columnsByCategory = useMemo(() => {
    const map = {};
    Object.values(SPRINT_COLUMN_CATEGORIES).forEach(cat => {
      map[cat] = [];
    });

    SPRINT_ALL_COLUMNS.forEach(col => {
      if (
        columnSearch.trim() === '' ||
        col.label.toLowerCase().includes(columnSearch.toLowerCase()) ||
        col.key.toLowerCase().includes(columnSearch.toLowerCase())
      ) {
        if (!map[col.category]) map[col.category] = [];
        map[col.category].push(col);
      }
    });

    return map;
  }, [columnSearch]);

  // Render cell content based on column definition
  const renderCellContent = (task, col) => {
    const rawVal = task[col.key];

    switch (col.type) {
      case 'title':
        return (
          <div className="table-task-title-cell" title={task.title || task.epic}>
            <strong>{task.title || task.epic || 'Untitled'}</strong>
          </div>
        );

      case 'code':
        return rawVal ? (
          <span className="table-code-badge" title={rawVal}>
            {rawVal}
          </span>
        ) : (
          <span className="table-empty-dash">-</span>
        );

      case 'platform': {
        const pList = splitMultiValue(task.platforms || task.platform);
        if (pList.length === 0) {
          return <span className="platform-tag-pill">General</span>;
        }
        return (
          <div className="cell-platform-stack">
            {pList.map((p, idx) => (
              <span key={idx} className="platform-tag-pill" title={`Platform: ${p}`}>
                {p}
              </span>
            ))}
          </div>
        );
      }

      case 'assignee': {
        const aList = splitMultiValue(task.assignees || task.assignee);
        if (aList.length === 0) {
          return <span className="assignee-empty-text">Unassigned</span>;
        }
        return (
          <div className="cell-assignee-stack">
            {aList.map((a, idx) => (
              <div key={idx} className="assignee-row-chip" title={`Assignee: ${a}`}>
                <Avatar name={a} size={20} />
                <span className="assignee-name-text">{a}</span>
              </div>
            ))}
          </div>
        );
      }

      case 'priority':
        return <PriorityBadge priority={task.priority} />;

      case 'stage':
        return (
          <span className={`stage-text-tag ${(task.stage || 'todo')}`}>
            {(task.stage || 'todo').replace('-', ' ')}
          </span>
        );

      case 'progress':
        return (
          <div className="table-progress-box">
            <span>{task.progress || 0}%</span>
            <div className="table-mini-bar-track">
              <div
                className="table-mini-bar-fill"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
          </div>
        );

      case 'badge':
        return rawVal ? (
          <span className="table-status-pill" title={rawVal}>
            {rawVal}
          </span>
        ) : (
          <span className="table-empty-dash">-</span>
        );

      case 'link':
        return rawVal ? (
          rawVal.startsWith('http') ? (
            <a
              href={rawVal}
              target="_blank"
              rel="noreferrer"
              className="table-link-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Open Link ↗
            </a>
          ) : (
            <span className="table-text-truncated" title={rawVal}>{rawVal}</span>
          )
        ) : (
          <span className="table-empty-dash">-</span>
        );

      case 'date':
        return rawVal ? (
          <span className="table-date-text">{rawVal}</span>
        ) : (
          <span className="table-empty-dash">-</span>
        );

      default:
        return rawVal !== null && rawVal !== undefined && String(rawVal).trim() !== '' ? (
          <span className="table-text-truncated" title={String(rawVal)}>
            {String(rawVal)}
          </span>
        ) : (
          <span className="table-empty-dash">-</span>
        );
    }
  };

  // Render header filter cell
  const renderFilterInput = (col) => {
    const currentVal = filters[col.key] || '';

    if (col.key === 'platform') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
          aria-label="Filter by platform"
        >
          <option value="">All</option>
          {uniquePlatforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      );
    }

    if (col.key === 'assignee') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('assignee', e.target.value)}
          aria-label="Filter by assignee"
        >
          <option value="">All</option>
          {uniqueAssignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      );
    }

    if (col.key === 'priority') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All</option>
          <option value={PRIORITIES.HIGH}>High</option>
          <option value={PRIORITIES.MEDIUM}>Medium</option>
          <option value={PRIORITIES.LOW}>Low</option>
        </select>
      );
    }

    if (col.key === 'stage') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('stage', e.target.value)}
          aria-label="Filter by stage"
        >
          <option value="">All</option>
          <option value={STAGES.TODO}>To Do</option>
          <option value={STAGES.IN_PROGRESS}>In Progress</option>
          <option value={STAGES.REVIEW}>In Review</option>
          <option value={STAGES.COMPLETED}>Completed</option>
        </select>
      );
    }

    if (col.key === 'progress') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('progress', e.target.value)}
          aria-label="Filter by progress"
        >
          <option value="">All</option>
          <option value="0">0%</option>
          <option value="1-49">1% - 49%</option>
          <option value="50-99">50% - 99%</option>
          <option value="100">100%</option>
        </select>
      );
    }

    if (col.key === 'final_dev_status') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('final_dev_status', e.target.value)}
          aria-label="Filter by final dev status"
        >
          <option value="">All Statuses</option>
          {uniqueDevStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      );
    }

    if (col.key === 'category') {
      return (
        <select
          className="col-filter-select"
          value={currentVal}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All</option>
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }

    if (col.type === 'date') {
      return (
        <input
          type="date"
          className="col-filter-input col-filter-date"
          value={currentVal}
          onChange={(e) => handleFilterChange(col.key, e.target.value)}
          aria-label={`Filter by ${col.label}`}
        />
      );
    }

    return (
      <input
        type="text"
        className="col-filter-input"
        placeholder={`Filter ${col.label}...`}
        value={currentVal}
        onChange={(e) => handleFilterChange(col.key, e.target.value)}
        aria-label={`Filter by ${col.label}`}
      />
    );
  };

  return (
    <div className="view-panel list-view-panel">
      <div className="table-card">
        {/* Table Top Toolbar */}
        <div className="table-top-toolbar">
          <div className="table-left-tools">
            <div className="table-count-info">
              Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
              {isFiltered && (
                <span className="filter-active-pill">Filters active</span>
              )}
            </div>

            {/* Quick View Preset Pills */}
            <div className="table-presets-row">
              <span className="presets-label">Views:</span>
              <button
                type="button"
                className={`btn-table-preset ${visibleColKeys.length === COLUMN_PRESETS.DEFAULT.keys.length && COLUMN_PRESETS.DEFAULT.keys.every(k => visibleColKeys.includes(k)) ? 'active' : ''}`}
                onClick={() => handleApplyPreset(COLUMN_PRESETS.DEFAULT)}
              >
                Default (12)
              </button>
              <button
                type="button"
                className={`btn-table-preset ${visibleColKeys.length === COLUMN_PRESETS.CORE.keys.length && COLUMN_PRESETS.CORE.keys.every(k => visibleColKeys.includes(k)) ? 'active' : ''}`}
                onClick={() => handleApplyPreset(COLUMN_PRESETS.CORE)}
              >
                Core
              </button>
              <button
                type="button"
                className={`btn-table-preset ${visibleColKeys.length === COLUMN_PRESETS.BUSINESS.keys.length && COLUMN_PRESETS.BUSINESS.keys.every(k => visibleColKeys.includes(k)) ? 'active' : ''}`}
                onClick={() => handleApplyPreset(COLUMN_PRESETS.BUSINESS)}
              >
                Business
              </button>
              <button
                type="button"
                className={`btn-table-preset ${visibleColKeys.length === COLUMN_PRESETS.DEV.keys.length && COLUMN_PRESETS.DEV.keys.every(k => visibleColKeys.includes(k)) ? 'active' : ''}`}
                onClick={() => handleApplyPreset(COLUMN_PRESETS.DEV)}
              >
                Dev & IT
              </button>
              <button
                type="button"
                className={`btn-table-preset ${visibleColKeys.length === SPRINT_ALL_COLUMNS.length ? 'active' : ''}`}
                onClick={handleSelectAllColumns}
              >
                All 37 Columns
              </button>
            </div>
          </div>

          <div className="table-right-tools">
            {isFiltered && (
              <button
                className="btn-clear-table-filters"
                onClick={handleResetFilters}
                type="button"
              >
                Clear Filters
              </button>
            )}

            {/* Column Customizer Button & Popover */}
            <div className="column-picker-wrapper" ref={pickerRef}>
              <button
                type="button"
                className="btn-customize-columns"
                onClick={() => setShowColumnPicker(prev => !prev)}
                aria-expanded={showColumnPicker}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                </svg>
                <span>Columns ({activeColumns.length}/{SPRINT_ALL_COLUMNS.length})</span>
              </button>

              {showColumnPicker && (
                <div className="column-picker-dropdown">
                  <div className="picker-header">
                    <div className="picker-title-row">
                      <h4>Display Columns</h4>
                      <div className="picker-actions">
                        <button type="button" onClick={handleSelectAllColumns} className="btn-picker-link">
                          All
                        </button>
                        <span>•</span>
                        <button type="button" onClick={handleResetDefaultColumns} className="btn-picker-link">
                          Default
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Search column..."
                      className="picker-search-input"
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="picker-scroll-body">
                    {Object.entries(columnsByCategory).map(([category, cols]) => {
                      if (cols.length === 0) return null;
                      return (
                        <div key={category} className="picker-category-group">
                          <div className="picker-category-title">{category}</div>
                          <div className="picker-items-grid">
                            {cols.map(col => {
                              const isChecked = visibleColKeys.includes(col.key);
                              return (
                                <label key={col.key} className="picker-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleColumn(col.key)}
                                  />
                                  <span className="picker-checkbox-label" title={col.label}>
                                    {col.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="picker-footer">
                    <span>{visibleColKeys.length} of {SPRINT_ALL_COLUMNS.length} visible</span>
                    <button
                      type="button"
                      className="btn-picker-done"
                      onClick={() => setShowColumnPicker(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Table with Horizontal & Vertical Scrolling */}
        <div className="table-scroll-wrapper wide-scroll-table">
          <table className="tasks-table">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="header-row">
                {activeColumns.map(col => (
                  <th
                    key={col.key}
                    className={`col-header-cell col-${col.key} ${col.isSticky ? 'sticky-col' : ''}`}
                    style={{
                      minWidth: `${col.minWidth}px`,
                      textAlign: col.align || 'left'
                    }}
                  >
                    {col.label.toUpperCase()}
                  </th>
                ))}
              </tr>

              {/* Row 2: Frozen Column Filter Row */}
              <tr className="filter-row">
                {activeColumns.map(col => (
                  <th
                    key={col.key}
                    className={`col-filter-cell col-${col.key} ${col.isSticky ? 'sticky-col' : ''}`}
                    style={{
                      minWidth: `${col.minWidth}px`
                    }}
                  >
                    {renderFilterInput(col)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length} className="table-empty-cell">
                    <div className="table-empty-wrap">
                      <p>No tasks match the active filters.</p>
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
                    {activeColumns.map(col => (
                      <td
                        key={col.key}
                        className={`cell-${col.key} ${col.isSticky ? 'sticky-col' : ''}`}
                        style={{
                          minWidth: `${col.minWidth}px`,
                          textAlign: col.align || 'left'
                        }}
                      >
                        {renderCellContent(task, col)}
                      </td>
                    ))}
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
