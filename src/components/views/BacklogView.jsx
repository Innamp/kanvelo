import React, { useState, useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { useToast } from '../../context/ToastContext';
import { PRIORITIES } from '../../constants';
import { InboxIcon, ArrowRightIcon } from '../common/Icons';

export function BacklogView({ onTaskClick }) {
  const { sprints, getTasksForSprint, moveTicketSprint } = useSprint();
  const { showToast } = useToast();

  const [selectedSprintFilter, setSelectedSprintFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [targetSprintToMove, setTargetSprintToMove] = useState(sprints[sprints.length - 1]?.id || 'sprint-10');

  // Gather tasks across sprints
  const allTasks = useMemo(() => {
    return getTasksForSprint(selectedSprintFilter);
  }, [selectedSprintFilter, getTasksForSprint]);

  // Backlog filter: tickets in Proposed, Ready for Planning, or Deprioritized
  const backlogTasks = useMemo(() => {
    return allTasks.filter(t => {
      const st = (t.lifecycle_stage || t.ticket_status || t.stage || '').toLowerCase();
      const isBacklogCandidate = st.includes('propos') || st.includes('plan') || st.includes('deprio') || st.includes('todo');
      if (!isBacklogCandidate) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (t.title || '').toLowerCase().includes(q) ||
          (t.ticket_code || t.code || '').toLowerCase().includes(q) ||
          (t.platforms || t.platform || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTasks, search]);

  const handleAssignToSprint = (task, targetSprintId) => {
    moveTicketSprint(task.current_sprint || 'sprint-10', targetSprintId, task.id, 'Allocated from backlog');
    showToast(`Ticket allocated to ${targetSprintId}`);
  };

  return (
    <div className="backlog-page-container animate-fade-in">
      {/* Header */}
      <div className="backlog-header-card card-styled">
        <div className="backlog-title-wrap">
          <div className="backlog-icon-box">
            <InboxIcon size={24} />
          </div>
          <div>
            <h2>Product & Engineering Backlog</h2>
            <p className="text-muted">
              Groom, prioritize, and allocate candidate tickets into target sprints
            </p>
          </div>
        </div>

        <div className="backlog-controls-wrap">
          <input
            type="text"
            placeholder="Search backlog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="filter-select-input"
          />

          <select
            value={selectedSprintFilter}
            onChange={e => setSelectedSprintFilter(e.target.value)}
            className="filter-select-input"
          >
            <option value="all">All Sprints</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Backlog Ledger Table */}
      <div className="backlog-table-card card-styled">
        <div className="table-header-title">
          <h4>Backlog Tickets ({backlogTasks.length})</h4>
          <span className="text-muted">Select target sprint to allocate directly</span>
        </div>

        <div className="table-responsive">
          <table className="backlog-ledger-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title / Epic</th>
                <th>Platform</th>
                <th>PM</th>
                <th>Priority</th>
                <th>Estimated MD</th>
                <th>Status</th>
                <th>Current Sprint</th>
                <th>Assign to Sprint</th>
              </tr>
            </thead>
            <tbody>
              {backlogTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-muted">
                    No backlog candidate tickets found.
                  </td>
                </tr>
              ) : (
                backlogTasks.map(task => (
                  <tr key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer">
                    <td><span className="code-chip">{task.ticket_code || task.code || 'S-TKT'}</span></td>
                    <td><strong>{task.title}</strong></td>
                    <td><span className="platform-tag-pill">{task.platforms || task.platform || 'General'}</span></td>
                    <td>{task.product_managers || task.product_manager || 'PMO'}</td>
                    <td><span className={`priority-pill priority-${(task.priority || 'Medium').toLowerCase()}`}>{task.priority || 'Medium'}</span></td>
                    <td>{task.mandays || 1} MD</td>
                    <td><span className="cell-status-chip">{task.ticket_status || task.stage}</span></td>
                    <td><strong>{task.current_sprint || 'Sprint 10'}</strong></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="quick-assign-wrap">
                        <select
                          className="assign-select-input"
                          defaultValue={targetSprintToMove}
                          onChange={(e) => handleAssignToSprint(task, e.target.value)}
                        >
                          {sprints.map(s => (
                            <option key={s.id} value={s.id}>Move to {s.name}</option>
                          ))}
                        </select>
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
