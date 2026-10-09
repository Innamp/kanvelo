import React from 'react';
import { PriorityBadge } from '../common/PriorityBadge';

export function ListView({ tasks, onTaskClick }) {
  return (
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
            {tasks.map(task => (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
              >
                <td><strong>{task.title}</strong></td>
                <td>
                  <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                    {task.platform || 'General'}
                  </span>
                </td>
                <td>{task.assignee || 'Unassigned'}</td>
                <td><PriorityBadge priority={task.priority} /></td>
                <td><strong>{task.mandays || 5} MD</strong></td>
                <td style={{ textTransform: 'capitalize' }}>
                  {(task.stage || 'todo').replace('-', ' ')}
                </td>
                <td>{task.progress || 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
