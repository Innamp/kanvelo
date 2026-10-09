import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { STAGES } from '../constants';

export function useTasks(initialSprintId = 'sprint-10') {
  const [sprintId, setSprintId] = useState(initialSprintId);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks when sprint changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    taskService.getTasks(sprintId)
      .then(data => {
        if (isMounted) {
          setTasks(data);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sprintId]);

  // Sync state & local fallback
  const syncState = useCallback((newTasks) => {
    setTasks(newTasks);
    taskService.saveToLocalFallback(sprintId, newTasks);
  }, [sprintId]);

  // Move task stage (Drag and Drop)
  const moveTaskStage = useCallback(async (taskId, targetStage) => {
    let progressVal = 0;
    if (targetStage === STAGES.COMPLETED) progressVal = 100;
    else if (targetStage === STAGES.IN_PROGRESS) progressVal = 60;
    else if (targetStage === STAGES.REVIEW) progressVal = 85;

    syncState(tasks.map(t => (
      t.id === taskId ? { ...t, stage: targetStage, progress: progressVal } : t
    )));

    await taskService.updateStage(taskId, targetStage, progressVal);
  }, [tasks, syncState]);

  // Update existing task
  const updateTask = useCallback(async (task) => {
    syncState(tasks.map(t => (t.id === task.id ? task : t)));
    await taskService.saveTask(task);
  }, [tasks, syncState]);

  // Create new task
  const createTask = useCallback(async (taskInput) => {
    const newTask = {
      ...taskInput,
      id: `${sprintId}-t${Date.now()}`,
      sprint_id: sprintId,
      progress: taskInput.stage === STAGES.COMPLETED ? 100 : 0,
      mandays: taskInput.mandays || '5',
      attachments_count: 0,
      comments_count: 1
    };

    syncState([newTask, ...tasks]);
    await taskService.saveTask(newTask);
    return newTask;
  }, [sprintId, tasks, syncState]);

  // Delete task
  const removeTask = useCallback(async (taskId) => {
    syncState(tasks.filter(t => t.id !== taskId));
    await taskService.deleteTask(taskId);
  }, [tasks, syncState]);

  return {
    sprintId,
    setSprintId,
    tasks,
    isLoading,
    error,
    moveTaskStage,
    updateTask,
    createTask,
    removeTask
  };
}
