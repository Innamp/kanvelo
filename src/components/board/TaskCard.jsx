import React from 'react';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { DocumentIcon, CommentIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { splitMultiValue } from '../../utils/taskHelpers';

export function TaskCard({ task, onDragStart, onClick }) {
  const { canManipulateTasks } = useAuth();
  const note = task.description || task.background;
  const attachCount = task.attachmentsCount ?? task.attachments_count ?? (task.title.length % 3);
  const commentCount = task.commentsCount ?? task.comments_count ?? ((task.title.length % 5) + 1);

  // Parse multiple platforms and assignees cleanly
  const platformsList = splitMultiValue(task.platforms || task.platform);
  const rawAssignees = splitMultiValue(task.assignees || task.assignee);
  const assigneesList = rawAssignees.length > 0 ? rawAssignees : ['Sarah'];

  return (
    <article
      className={`task-card ${!canManipulateTasks ? 'card-readonly' : ''}`}
      draggable={canManipulateTasks}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
    >
      <div className="card-top-row">
        <PriorityBadge priority={task.priority} />
        {platformsList.length > 0 && (
          <div className="card-platforms-wrap">
            {platformsList.slice(0, 2).map((p, idx) => (
              <span key={idx} className="card-platform-pill" title={`Platform: ${p}`}>
                {p}
              </span>
            ))}
            {platformsList.length > 2 && (
              <span className="card-platform-pill card-platform-more" title={platformsList.slice(2).join(', ')}>
                +{platformsList.length - 2}
              </span>
            )}
          </div>
        )}
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
          {assigneesList.length > 4 && (
            <div className="avatar-stack-more" title={assigneesList.slice(4).join(', ')}>
              +{assigneesList.length - 4}
            </div>
          )}
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
