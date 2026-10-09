import React from 'react';
import { COLUMNS } from '../../constants';
import { KanbanColumn } from './KanbanColumn';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function BoardView({
  tasks,
  onMoveStage,
  onTaskClick
}) {
  const { canManipulateTasks } = useAuth();
  const { showToast } = useToast();

  const handleDragStart = (e, taskId) => {
    if (!canManipulateTasks) {
      e.preventDefault();
      showToast('Viewers cannot move or modify tasks (Read-only mode)');
      return;
    }
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (taskId, targetStage) => {
    if (!canManipulateTasks) {
      showToast('Viewers cannot modify task status');
      return;
    }
    onMoveStage(taskId, targetStage);
  };

  return (
    <div className="board-container">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => (t.stage || 'todo') === col.key);

        return (
          <KanbanColumn
            key={col.key}
            column={col}
            tasks={columnTasks}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onTaskClick={onTaskClick}
          />
        );
      })}
    </div>
  );
}
