import React from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { DocumentIcon, CommentIcon } from '../common/Icons';

export function TaskCard({ task, onDragStart, onClick }) {
  const note = task.description || task.background;
  const attachCount = task.attachmentsCount ?? task.attachments_count ?? (task.title.length % 3);
  const commentCount = task.commentsCount ?? task.comments_count ?? ((task.title.length % 5) + 1);

  // Parse multiple assignees if provided as a comma or & separated string or array
  const rawAssignees = Array.isArray(task.assignees)
    ? task.assignees
    : (task.assignee || 'Sarah')
        .split(/[,&/]/)
        .map(a => a.trim())
        .filter(Boolean);

  const assigneesList = rawAssignees.length > 0 ? rawAssignees : ['Sarah'];

  return (
    <article
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
    >
      <div className="card-top-row">
        <PriorityBadge priority={task.priority} />
      </div>

      <h3 className="card-task-title">{task.title}</h3>

      {note ? (
        <p className="card-task-note">Note: {note}</p>
      ) : null}

      <ProgressBar progress={task.progress ?? 0} />

      <footer className="card-footer-row">
        <div className="card-assignees">
          {assigneesList.slice(0, 4).map((assignee, idx) => (
            <Avatar
              key={idx}
              seed={`${assignee}_${idx}`}
              name={assignee}
              size={24}
              className="card-assignee-avatar"
            />
          ))}
        </div>

        <div className="card-meta-counts">
          <span className="card-count-item" title={`${attachCount} attachments`}>
            <DocumentIcon size={13} />
            <span>{attachCount}</span>
          </span>
          <span className="card-count-item" title={`${commentCount} comments`}>
            <CommentIcon size={13} />
            <span>{commentCount}</span>
          </span>
        </div>
      </footer>
    </article>
  );
}
