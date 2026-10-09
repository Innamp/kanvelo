import React from 'react';
import { COLUMNS } from '../../constants';
import { KanbanColumn } from './KanbanColumn';

export function BoardView({
  tasks,
  onMoveStage,
  onTaskClick
}) {
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
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
            onDrop={onMoveStage}
            onTaskClick={onTaskClick}
          />
        );
      })}
    </div>
  );
}
