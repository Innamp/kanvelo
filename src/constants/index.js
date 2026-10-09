/**
 * Application Constants & Configuration
 */

export const STAGES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed'
};

export const COLUMNS = [
  { key: STAGES.TODO, title: 'To Do', className: 'col-todo' },
  { key: STAGES.IN_PROGRESS, title: 'In Progress', className: 'col-progress' },
  { key: STAGES.REVIEW, title: 'In Review', className: 'col-review' },
  { key: STAGES.COMPLETED, title: 'Completed', className: 'col-completed' }
];

export const PRIORITIES = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const PRIORITY_WEIGHTS = {
  [PRIORITIES.HIGH]: 3,
  [PRIORITIES.MEDIUM]: 2,
  [PRIORITIES.LOW]: 1
};

export const VIEWS = {
  OVERVIEW: 'overview',
  LIST: 'list',
  BOARD: 'board',
  CALENDAR: 'calendar',
  DOCUMENTS: 'documents',
  MESSAGES: 'messages',
  USERS: 'users'
};

export const SPRINTS = [
  { id: 'sprint-10', label: 'Sprint 10 (Current)' },
  { id: 'sprint-9', label: 'Sprint 9' },
  { id: 'sprint-8', label: 'Sprint 8' },
  { id: 'all', label: 'All Sprints' }
];

export const DEMO_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop'
];

export const ROLES = {
  ADMIN: 'administrator',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.CONTRIBUTOR]: 'Contributor',
  [ROLES.VIEWER]: 'Viewer'
};

