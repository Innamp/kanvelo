import { INITIAL_SPRINT_DATA } from '../data/initialTasks';

const API_BASE = 'api.php';
const STORAGE_PREFIX = 'novaboard_react_';

/**
 * Task Service providing clean data abstraction over SQLite REST API
 * with graceful fallback to LocalStorage/static data on static hosting (e.g. GitHub Pages).
 */
class TaskService {
  constructor() {
    this.isApiAvailable = null;
  }

  async checkApiAvailability() {
    if (this.isApiAvailable !== null) return this.isApiAvailable;
    try {
      const res = await fetch(`${API_BASE}?action=get_sprints`, { method: 'GET' });
      this.isApiAvailable = res.ok;
    } catch {
      this.isApiAvailable = false;
    }
    return this.isApiAvailable;
  }

  async getTasks(sprintId = 'sprint-10') {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}?action=get_tasks&sprint_id=${sprintId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.tasks) {
            return data.tasks;
          }
        }
      } catch (err) {
        console.warn('API error, falling back to local cache', err);
      }
    }

    // Local fallback
    const cached = localStorage.getItem(`${STORAGE_PREFIX}${sprintId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cache', e);
      }
    }

    const defaultData = INITIAL_SPRINT_DATA[sprintId] || INITIAL_SPRINT_DATA['sprint-10'];
    return defaultData?.tasks || [];
  }

  async updateStage(taskId, stage, progress) {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        await fetch(`${API_BASE}?action=update_stage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, stage, progress })
        });
      } catch (err) {
        console.error('Failed to sync stage update to SQLite API', err);
      }
    }
  }

  async saveTask(task) {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}?action=save_task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        return await res.json();
      } catch (err) {
        console.error('Failed to save task to SQLite API', err);
      }
    }
    return { status: 'success', id: task.id };
  }

  async deleteTask(taskId) {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        await fetch(`${API_BASE}?action=delete_task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId })
        });
      } catch (err) {
        console.error('Failed to delete task in SQLite API', err);
      }
    }
  }

  saveToLocalFallback(sprintId, tasks) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${sprintId}`, JSON.stringify(tasks));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }
}

export const taskService = new TaskService();
