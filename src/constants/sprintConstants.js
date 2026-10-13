/**
 * Sprint Management & Lifecycle Constants
 */

export const SPRINT_STATUSES = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  LOCKED: 'Locked',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed'
};

export const SPRINT_HEALTH = {
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  DELAYED: 'Delayed'
};

export const SPRINT_PHASE_NAMES = [
  'BRD Submission',
  'BRD Assessment',
  'Backlog Grooming',
  'Local / Global Review',
  'PRD Creation',
  'IT Assessment',
  'Sprint Planning',
  'Development',
  'UAT',
  'Deployment',
  'Release Note'
];

export const PHASE_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
  BLOCKED: 'Blocked',
  NOT_APPLICABLE: 'Not Applicable'
};

export const LIFECYCLE_STAGES = [
  { key: 'proposed', title: 'Proposed', color: '#94a3b8' },
  { key: 'brd-assessment', title: 'BRD Assessment', color: '#6366f1' },
  { key: 'ready-planning', title: 'Ready for Planning', color: '#3b82f6' },
  { key: 'development', title: 'Development', color: '#e67d22' },
  { key: 'code-review', title: 'Code Review', color: '#0ea5e9' },
  { key: 'uat', title: 'UAT', color: '#8b5cf6' },
  { key: 'ready-deploy', title: 'Ready to Deploy', color: '#10b981' },
  { key: 'deployed', title: 'Deployed', color: '#059669' },
  { key: 'carry-over', title: 'Carry Over', color: '#f59e0b' },
  { key: 'deprioritized', title: 'Deprioritized', color: '#64748b' },
  { key: 'cancelled', title: 'Cancelled', color: '#ef4444' }
];

export const UAT_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  PASSED: 'Passed',
  FAILED: 'Failed',
  WAIVED: 'Waived'
};

export const DEPLOYMENT_READINESS = {
  NOT_READY: 'Not Ready',
  IN_TESTING: 'In Testing',
  READY: 'Ready to Deploy',
  DEPLOYED: 'Deployed',
  BLOCKED: 'Blocked'
};
