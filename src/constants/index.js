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
  DASHBOARD: 'overview',
  OVERVIEW: 'overview',
  SPRINTS: 'sprints',
  SPRINT_DETAIL: 'sprint-detail',
  BACKLOG: 'backlog',
  TICKET_LIST: 'list',
  LIST: 'list',
  KANBAN: 'board',
  BOARD: 'board',
  TIMELINE: 'timeline',
  CALENDAR: 'calendar',
  REPORTS: 'reports',
  CONFIGURATION: 'configuration',
  DOCUMENTS: 'documents',
  MESSAGES: 'messages',
  USERS: 'users'
};

export const SPRINTS = [
  { id: 'all', label: 'All Sprints' },
  { id: 'sprint-10', label: 'Sprint 10 (Active)' },
  { id: 'sprint-9', label: 'Sprint 9' },
  { id: 'sprint-8', label: 'Sprint 8' },
  { id: 'sprint-7', label: 'Sprint 7' },
  { id: 'sprint-6', label: 'Sprint 6' },
  { id: 'sprint-5', label: 'Sprint 5' },
  { id: 'sprint-4', label: 'Sprint 4' },
  { id: 'sprint-3', label: 'Sprint 3' },
  { id: 'sprint-2', label: 'Sprint 2' },
  { id: 'sprint-1', label: 'Sprint 1' }
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
export const DEFAULT_PLATFORMS = [
  'AYO Toko',
  'CITA',
  'My Hero',
  'MyHero Backend',
  'AYO Principal',
  'OSEM',
  'DTE',
  'AYO Kasir',
  'AYO Mitra',
  'AYO Qoncierge',
  'AMO',
  'Mobile App'
];
