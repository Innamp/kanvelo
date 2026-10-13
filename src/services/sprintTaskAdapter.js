import { INITIAL_SPRINT_DATA } from '../data/initialTasks';
import { INITIAL_SPRINT_MASTERS } from '../data/sprintMasterData';
import { LIFECYCLE_STAGES, UAT_STATUSES, DEPLOYMENT_READINESS } from '../constants/sprintConstants';

const TASKS_STORAGE_KEY_PREFIX = 'kanvelo_sprint_tasks_';

/**
 * Maps raw legacy task to enhanced Sprint-Centric Task model
 */
export function normalizeTask(task, sprintId) {
  const sprintNum = parseInt(sprintId.replace('sprint-', ''), 10) || 10;
  const isSprintCompleted = sprintNum < 10;

  // Determine stage and lifecycle
  let stage = task.stage || 'todo';
  let lifecycleStage = 'development';
  if (isSprintCompleted) {
    stage = 'completed';
    lifecycleStage = 'deployed';
  } else {
    if (stage === 'completed') lifecycleStage = 'deployed';
    else if (stage === 'review') lifecycleStage = 'uat';
    else if (stage === 'in-progress') lifecycleStage = 'development';
    else lifecycleStage = 'ready-planning';
  }

  // Cross-sprint and carry-over logic
  const isCarryOver = Boolean(
    task.carry_over === 'Yes' ||
    task.cross_sprint === 'Yes' ||
    (task.id && task.id.includes('carry')) ||
    (sprintNum === 10 && (task.id === 'ref-prog-1' || task.id === 'ref-review-1'))
  );

  const prevSprintId = isCarryOver ? `sprint-${Math.max(1, sprintNum - 1)}` : '';
  const firstShownSprintId = isCarryOver ? `sprint-${Math.max(1, sprintNum - 2)}` : sprintId;

  // Sprint Movement History
  const defaultHistory = [
    {
      sprint: firstShownSprintId,
      date: '2024-08-15',
      action: 'Proposed in Backlog',
      user: 'Inna MP'
    }
  ];

  if (isCarryOver) {
    defaultHistory.push({
      sprint: prevSprintId,
      date: '2024-10-10',
      action: 'Carried Over',
      reason: task.carry_over_reason || 'UAT scope expansion required cross-sprint continuation',
      user: 'Release Team'
    });
  }

  defaultHistory.push({
    sprint: sprintId,
    date: '2024-11-26',
    action: isSprintCompleted ? 'Deployed to Production' : 'Allocated to Current Sprint',
    user: 'Inna MP'
  });

  let plannedMd = parseFloat(task.mandays) || (task.priority === 'High' ? 6 : task.priority === 'Medium' ? 4 : 2);
  if (plannedMd > 500) plannedMd = 14;
  const consumedMd = isSprintCompleted ? plannedMd : (stage === 'completed' ? plannedMd : (stage === 'review' ? plannedMd * 0.85 : (stage === 'in-progress' ? plannedMd * 0.5 : 0)));

  return {
    ...task,
    id: task.id || `task-${sprintId}-${Math.random().toString(36).substr(2, 6)}`,
    ticket_code: task.ticket_code || `TIC-${String(sprintNum).padStart(2, '0')}-${(task.id || '').replace(/\D/g, '').slice(-3) || '101'}`,
    title: task.title || task.epic || 'Untitled Task',
    epic: task.epic || task.title || '',
    platform: task.platform || 'AYO Toko',
    sub_platform: task.sub_platform || 'Core Engine',
    assignee: task.assignee || 'Inna MP',
    pm: task.business_owner_pic || task.assignee || 'Commercial Team',
    requestor: task.requestor || 'Operations Dept',
    priority: task.priority || 'Medium',
    final_prio_rank: task.final_prio_rank || (task.priority === 'High' ? 'P1' : task.priority === 'Medium' ? 'P2' : 'P3'),
    stage,
    lifecycle_stage: task.lifecycle_stage || lifecycleStage,
    current_phase: task.current_phase || (isSprintCompleted ? 'Release Note' : 'Development'),
    progress: isSprintCompleted ? 100 : (task.progress || 0),
    planned_mandays: plannedMd,
    consumed_mandays: Math.round(consumedMd * 10) / 10,
    mandays: String(plannedMd),
    uat_status: isSprintCompleted ? UAT_STATUSES.PASSED : (stage === 'completed' ? UAT_STATUSES.PASSED : (stage === 'review' ? UAT_STATUSES.IN_PROGRESS : UAT_STATUSES.NOT_STARTED)),
    deployment_readiness: isSprintCompleted ? DEPLOYMENT_READINESS.DEPLOYED : (stage === 'completed' ? DEPLOYMENT_READINESS.READY : DEPLOYMENT_READINESS.IN_TESTING),
    expected_deployment_date: task.expected_deployment_date || (isSprintCompleted ? '2024-10-18' : '2025-01-10'),
    actual_deployment_date: isSprintCompleted ? '2024-10-18' : '',
    cross_sprint: isCarryOver ? 'Yes' : (task.cross_sprint || 'No'),
    carry_over: isCarryOver ? 'Yes' : (task.carry_over || 'No'),
    first_shown_sprint: task.first_shown_sprint || firstShownSprintId,
    start_dev_sprint: task.start_dev_sprint || (isCarryOver ? prevSprintId : sprintId),
    current_sprint: sprintId,
    target_dep_sprint: task.target_dep_sprint || sprintId,
    expected_dep_sprint: task.expected_dep_sprint || sprintId,
    previous_sprint: prevSprintId,
    carry_over_reason: isCarryOver ? (task.carry_over_reason || 'Dependencies across distributor backend were pending completion.') : '',
    deprioritization_reason: task.deprioritization_reason || '',
    dependency: task.dependency || (task.priority === 'High' ? 'Backend API Auth v2.1' : 'None'),
    sprint_history: task.sprint_history || defaultHistory
  };
}

/**
 * Returns tasks for any sprint (Sprint 1..10) from cache or synthetic generator based on INITIAL_SPRINT_DATA
 */
export function getSprintTasks(sprintId) {
  const cacheKey = `${TASKS_STORAGE_KEY_PREFIX}${sprintId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return parsed.map(t => {
        if (parseFloat(t.mandays) > 500) {
          t.mandays = '14';
          t.planned_mandays = 14;
          t.consumed_mandays = Math.min(14, t.consumed_mandays);
        }
        return t;
      });
    } catch (e) {
      console.error('Failed to parse cached sprint tasks', e);
    }
  }

  // If in initial tasks:
  let rawList = INITIAL_SPRINT_DATA[sprintId]?.tasks;

  // If Sprint 1 to 7, generate clean, realistic tasks modeled from Sprint 8 & 9
  if (!rawList || rawList.length === 0) {
    const templateTasks = INITIAL_SPRINT_DATA['sprint-8']?.tasks || INITIAL_SPRINT_DATA['sprint-10']?.tasks || [];
    const sprintNum = parseInt(sprintId.replace('sprint-', ''), 10) || 1;
    const sliceCount = Math.max(12, 10 + (sprintNum * 3));

    rawList = templateTasks.slice(0, sliceCount).map((t, idx) => ({
      ...t,
      id: `${sprintId}-t${idx + 1}`,
      ticket_code: `TIC-${String(sprintNum).padStart(2, '0')}-${String(idx + 1).padStart(3, '0')}`,
      title: `[${sprintId.toUpperCase()}] ${t.title || t.epic}`,
      stage: 'completed',
      progress: 100,
      mandays: t.mandays || '4'
    }));
  }

  const normalized = rawList.map(t => normalizeTask(t, sprintId));
  saveSprintTasks(sprintId, normalized);
  return normalized;
}

export function saveSprintTasks(sprintId, tasks) {
  try {
    localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}${sprintId}`, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save sprint tasks to localStorage', e);
  }
}
