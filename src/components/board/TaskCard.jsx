import React from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { AttachmentIcon, CommentIcon } from '../common/Icons';

export function TaskCard({ task, onDragStart, onClick }) {
  const note = task.description || task.background || 'Ensure all acceptance criteria are met.';
  const attachCount = task.attachments_count ?? (task.title.length % 3);
  const commentCount = task.comments_count ?? ((task.title.length % 5) + 1);

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
      <PriorityBadge priority={task.priority} />
      <h3 className="card-task-title">{task.title}</h3>
      <p className="card-task-note">Note: {note}</p>

      <ProgressBar progress={task.progress} />

      <footer className="card-footer-row">
        <div className="card-assignees">
          <Avatar seed={task.assignee || task.id} name={task.assignee} />
          {task.assignee && task.assignee.includes('&') && (
            <Avatar seed={`${task.assignee}_co`} name="Co-assignee" />
          )}
        </div>

        <div className="card-meta-counts">
          <span className="card-count-item" title={`${attachCount} attachments`}>
            <AttachmentIcon />
            {attachCount}
          </span>
          <span className="card-count-item" title={`${commentCount} comments`}>
            <CommentIcon />
            {commentCount}
          </span>
        </div>
      </footer>
    </article>
  );
}
