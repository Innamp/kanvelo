import React, { useState } from 'react';
import { TaskCard } from './TaskCard';

export function KanbanColumn({
  column,
  tasks,
  onDragStart,
  onDrop,
  onTaskClick
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId, column.key);
    }
  };

  return (
    <section
      className={`kanban-column ${column.className} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${column.title} column`}
    >
      <header className="col-header-bar">
        <div className="col-header-left">
          <span className="col-header-dot" aria-hidden="true" />
          <h2 className="col-header-title">{column.title}</h2>
        </div>
        <button className="col-header-more" aria-label="Column actions">•••</button>
      </header>

      <div className="column-cards-stack">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </section>
  );
}
