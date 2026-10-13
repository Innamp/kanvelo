import React, { useState, useMemo } from 'react';
import { splitMultiValue } from '../../../utils/taskHelpers';
import { PRIORITIES } from '../../../constants';
import { FilterIcon, ArrowRightIcon } from '../../common/Icons';

export function SprintTicketsTab({ sprint, tasks, onTaskClick }) {
  // Filters state
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterSubPlatform, setFilterSubPlatform] = useState('all');
  const [filterPM, setFilterPM] = useState('all');
  const [filterRequestor, setFilterRequestor] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterFinalRank, setFilterFinalRank] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterCarryOver, setFilterCarryOver] = useState('all'); // all, yes, no
  const [filterCrossSprint, setFilterCrossSprint] = useState('all'); // all, yes, no
  const [filterDependency, setFilterDependency] = useState('all');

  // Dynamic filter dropdown options
  const filterOptions = useMemo(() => {
    const platforms = new Set();
    const subPlatforms = new Set();
    const pms = new Set();
    const requestors = new Set();
    const assignees = new Set();
    const statuses = new Set();
    const phases = new Set();
    const finalRanks = new Set();

    tasks.forEach(t => {
      splitMultiValue(t.platforms || t.platform).forEach(p => p && platforms.add(p));
      if (t.sub_platform) subPlatforms.add(t.sub_platform);
      splitMultiValue(t.product_managers || t.product_manager).forEach(pm => pm && pms.add(pm));
      if (t.requestor) requestors.add(t.requestor);
      splitMultiValue(t.assignees || t.assignee).forEach(a => a && assignees.add(a));
      if (t.ticket_status || t.stage) statuses.add(t.ticket_status || t.stage);
      if (t.current_sprint_phase || t.currentPhase) phases.add(t.current_sprint_phase || t.currentPhase);
      if (t.final_prio_rank) finalRanks.add(t.final_prio_rank);
    });

    return {
      platforms: Array.from(platforms).sort(),
      subPlatforms: Array.from(subPlatforms).sort(),
      pms: Array.from(pms).sort(),
      requestors: Array.from(requestors).sort(),
      assignees: Array.from(assignees).sort(),
      statuses: Array.from(statuses).sort(),
      phases: Array.from(phases).sort(),
      finalRanks: Array.from(finalRanks).sort()
    };
  }, [tasks]);

  // Filtered task results
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = search.toLowerCase().trim();
      if (q) {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const codeMatch = (t.ticket_code || t.code || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        if (!titleMatch && !codeMatch && !descMatch) return false;
      }

      // Platform
      if (filterPlatform !== 'all') {
        const pList = splitMultiValue(t.platforms || t.platform);
        if (!pList.includes(filterPlatform)) return false;
      }

      // Sub Platform
      if (filterSubPlatform !== 'all' && t.sub_platform !== filterSubPlatform) return false;

      // PM
      if (filterPM !== 'all') {
        const pmList = splitMultiValue(t.product_managers || t.product_manager);
        if (!pmList.includes(filterPM)) return false;
      }

      // Requestor
      if (filterRequestor !== 'all' && t.requestor !== filterRequestor) return false;

      // Assignee
      if (filterAssignee !== 'all') {
        const aList = splitMultiValue(t.assignees || t.assignee);
        if (!aList.includes(filterAssignee)) return false;
      }

      // Priority
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

      // Final Rank
      if (filterFinalRank !== 'all' && t.final_prio_rank !== filterFinalRank) return false;

      // Status
      if (filterStatus !== 'all' && (t.ticket_status || t.stage) !== filterStatus) return false;

      // Phase
      if (filterPhase !== 'all' && (t.current_sprint_phase || t.currentPhase) !== filterPhase) return false;

      // Carry Over
      if (filterCarryOver === 'yes' && t.carry_over !== 'Yes' && !t.is_carry_over) return false;
      if (filterCarryOver === 'no' && (t.carry_over === 'Yes' || t.is_carry_over)) return false;

      // Cross Sprint
      if (filterCrossSprint === 'yes' && t.cross_sprint !== 'Yes') return false;
      if (filterCrossSprint === 'no' && t.cross_sprint === 'Yes') return false;

      // Dependency
      if (filterDependency === 'has-dep' && !t.dependency && !t.blocking_tasks) return false;
      if (filterDependency === 'no-dep' && (t.dependency || t.blocking_tasks)) return false;

      return true;
    });
  }, [
    tasks, search, filterPlatform, filterSubPlatform, filterPM, filterRequestor,
    filterAssignee, filterPriority, filterFinalRank, filterStatus, filterPhase,
    filterCarryOver, filterCrossSprint, filterDependency
  ]);

  const resetFilters = () => {
    setSearch('');
    setFilterPlatform('all');
    setFilterSubPlatform('all');
    setFilterPM('all');
    setFilterRequestor('all');
    setFilterAssignee('all');
    setFilterPriority('all');
    setFilterFinalRank('all');
    setFilterStatus('all');
    setFilterPhase('all');
    setFilterCarryOver('all');
    setFilterCrossSprint('all');
    setFilterDependency('all');
  };

  return (
    <div className="sprint-tickets-tab animate-fade-in">
      {/* Search & Comprehensive Filters Panel */}
      <div className="tickets-filter-card card-styled">
        <div className="tickets-search-row">
          <div className="search-input-box">
            <input
              type="text"
              placeholder="Search ticket code, title, epic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-select-input"
            />
          </div>

          <div className="search-actions-box">
            <span className="tickets-count-badge">
              <strong>{filteredTasks.length}</strong> of {tasks.length} tickets
            </span>
            <button className="btn-secondary btn-sm" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="tickets-filter-grid">
          <div className="filter-group-mini">
            <label>Platform</label>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Sub-Platform</label>
            <select value={filterSubPlatform} onChange={e => setFilterSubPlatform(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.subPlatforms.map(sp => <option key={sp} value={sp}>{sp}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Product Manager</label>
            <select value={filterPM} onChange={e => setFilterPM(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.pms.map(pm => <option key={pm} value={pm}>{pm}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>PIC / Assignee</label>
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Priority</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {Object.values(PRIORITIES).map(pr => <option key={pr} value={pr}>{pr}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Final Rank</label>
            <select value={filterFinalRank} onChange={e => setFilterFinalRank(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.finalRanks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Ticket Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Sprint Phase</label>
            <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              {filterOptions.phases.map(ph => <option key={ph} value={ph}>{ph}</option>)}
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Carry Over</label>
            <select value={filterCarryOver} onChange={e => setFilterCarryOver(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              <option value="yes">Carry Over Only</option>
              <option value="no">Standard</option>
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Cross Sprint</label>
            <select value={filterCrossSprint} onChange={e => setFilterCrossSprint(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              <option value="yes">Cross Sprint</option>
              <option value="no">Single Sprint</option>
            </select>
          </div>

          <div className="filter-group-mini">
            <label>Dependency</label>
            <select value={filterDependency} onChange={e => setFilterDependency(e.target.value)} className="filter-select-input">
              <option value="all">All</option>
              <option value="has-dep">Has Dependency</option>
              <option value="no-dep">No Dependency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Ledger Table */}
      <div className="tickets-table-card card-styled">
        <div className="table-responsive">
          <table className="sprint-tickets-ledger">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title / Epic</th>
                <th>Platform</th>
                <th>PM</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Rank</th>
                <th>Current Phase</th>
                <th>Status</th>
                <th>Planned MD</th>
                <th>Consumed MD</th>
                <th>Progress</th>
                <th>UAT</th>
                <th>Deployment Date</th>
                <th>Carry Over</th>
                <th>Dependency</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="16" className="text-center py-6 text-muted">
                    No tickets found matching current filters for this sprint.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isCarry = task.carry_over === 'Yes' || task.is_carry_over;
                  const isCross = task.cross_sprint === 'Yes';
                  const priorityClass = `priority-${(task.priority || 'Medium').toLowerCase()}`;

                  return (
                    <tr
                      key={task.id}
                      className="ticket-interactive-row"
                      onClick={() => onTaskClick(task)}
                      title="Click to view & edit ticket details"
                    >
                      <td>
                        <span className="code-chip">{task.ticket_code || task.code || 'S-TKT'}</span>
                      </td>
                      <td className="cell-task-title-wrap">
                        <strong className="task-title-text">{task.title}</strong>
                        {isCross && (
                          <div className="cross-sprint-badge-row">
                            <span className="cross-badge">
                              {task.first_shown_sprint || task.ticket_1st_shown || 'S' + (sprint.number - 1)}
                              {' → '}
                              {sprint.name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="platform-tag-pill">
                          {task.platforms || task.platform || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="cell-pm-text">
                          {task.product_managers || task.product_manager || 'PMO'}
                        </span>
                      </td>
                      <td>
                        <span className="cell-assignee-text">
                          {task.assignees || task.assignee || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-pill ${priorityClass}`}>
                          {task.priority || 'Medium'}
                        </span>
                      </td>
                      <td>
                        <span className="rank-chip">{task.final_prio_rank || '—'}</span>
                      </td>
                      <td>
                        <span className="cell-phase-chip">
                          {task.current_sprint_phase || task.currentPhase || sprint.currentPhase}
                        </span>
                      </td>
                      <td>
                        <span className="cell-status-chip">
                          {task.ticket_status || task.stage || 'Proposed'}
                        </span>
                      </td>
                      <td>
                        <span className="md-val">{task.mandays || 1} MD</span>
                      </td>
                      <td>
                        <span className="md-val text-muted">{task.consumed_mandays || task.mandays_consumption_se || 0} MD</span>
                      </td>
                      <td>
                        <div className="progress-cell-wrap">
                          <div className="progress-bar-track mini">
                            <div
                              className="progress-bar-fill fill-primary"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span>{task.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="uat-chip">{task.uat_status || 'Pending'}</span>
                      </td>
                      <td>
                        <span className="cell-date-text">
                          {task.expected_deployment_date || task.deployment_date || sprint.endDate}
                        </span>
                      </td>
                      <td>
                        {isCarry ? (
                          <span className="carryover-pill" title={task.carry_over_reason || 'Moved from previous sprint'}>
                            🔁 Carry Over
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {task.dependency || task.blocking_tasks ? (
                          <span className="dep-pill" title={task.dependency || task.blocking_tasks}>
                            🔗 Dep
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
