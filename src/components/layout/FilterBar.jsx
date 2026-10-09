import React from 'react';
import { SearchIcon, PlusIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function FilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  onOpenCreate
}) {
  const { canManipulateTasks, isViewer } = useAuth();
  const { showToast } = useToast();

  const handleAddClick = () => {
    if (!canManipulateTasks) {
      showToast('Viewers have read-only permissions and cannot create tasks');
      return;
    }
    onOpenCreate();
  };

  return (
    <div className="action-filter-bar">
      <div className="action-filters-left">
        <div className="filter-search-box">
          <SearchIcon size={14} />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search task"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filter tasks by name or description"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select
            className="pill-dropdown"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="stage">Stage</option>
            <option value="priority">Priority</option>
            <option value="mandays">Mandays</option>
            <option value="title">Title</option>
          </select>
        </div>

        <button className="pill-action-btn" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
        </button>
      </div>

      <button
        className={`btn-add-task-yellow ${isViewer ? 'btn-disabled-viewer' : ''}`}
        onClick={handleAddClick}
        type="button"
        title={isViewer ? 'Read-only mode (Viewer)' : 'Add new sprint task'}
      >
        <PlusIcon size={16} />
        {isViewer ? 'View Only' : 'Add New Task'}
      </button>
    </div>
  );
}
