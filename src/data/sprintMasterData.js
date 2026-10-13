import { SPRINT_STATUSES, SPRINT_HEALTH, SPRINT_PHASE_NAMES, PHASE_STATUSES } from '../constants/sprintConstants';

function createPhases(startDateStr, endDateStr, currentPhaseIdx, sprintStatus) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const daysPerPhase = Math.max(1, Math.round(totalDays / SPRINT_PHASE_NAMES.length));

  return SPRINT_PHASE_NAMES.map((name, idx) => {
    const phaseStart = new Date(start);
    phaseStart.setDate(start.getDate() + (idx * daysPerPhase));
    const phaseEnd = new Date(phaseStart);
    phaseEnd.setDate(phaseStart.getDate() + daysPerPhase - 1);
    if (idx === SPRINT_PHASE_NAMES.length - 1) {
      phaseEnd.setTime(end.getTime());
    }

    let status = PHASE_STATUSES.NOT_STARTED;
    let progress = 0;

    if (sprintStatus === SPRINT_STATUSES.COMPLETED) {
      status = PHASE_STATUSES.COMPLETED;
      progress = 100;
    } else if (idx < currentPhaseIdx) {
      status = PHASE_STATUSES.COMPLETED;
      progress = 100;
    } else if (idx === currentPhaseIdx) {
      status = PHASE_STATUSES.IN_PROGRESS;
      progress = 65;
    } else {
      status = PHASE_STATUSES.NOT_STARTED;
      progress = 0;
    }

    // Assign realistic owners per phase
    let owner = 'Inna MP';
    if (name.includes('BRD')) owner = 'Commercial Product Team';
    else if (name.includes('Review') || name.includes('PRD')) owner = 'Inna MP / PMO Lead';
    else if (name.includes('IT Assessment') || name.includes('Planning')) owner = 'Arch & Engineering Lead';
    else if (name.includes('Development')) owner = 'Fullstack Dev Team';
    else if (name.includes('UAT')) owner = 'QA & Commercial UAT';
    else if (name.includes('Deployment') || name.includes('Release Note')) owner = 'DevOps / Release Team';

    const fmt = (d) => d.toISOString().split('T')[0];

    return {
      id: `phase-${idx + 1}`,
      number: idx + 1,
      name,
      plannedStartDate: fmt(phaseStart),
      plannedEndDate: fmt(phaseEnd),
      actualStartDate: idx <= currentPhaseIdx ? fmt(phaseStart) : '',
      actualEndDate: idx < currentPhaseIdx || sprintStatus === SPRINT_STATUSES.COMPLETED ? fmt(phaseEnd) : '',
      owner,
      status,
      progress,
      relatedTicketsCount: Math.max(5, 25 - idx),
      dependency: idx > 0 ? SPRINT_PHASE_NAMES[idx - 1] : 'None',
      remarks: idx === currentPhaseIdx ? 'Currently undergoing active execution & sprint synchronization.' : ''
    };
  });
}

export const INITIAL_SPRINT_MASTERS = [
  {
    id: 'sprint-1',
    number: 1,
    name: 'Sprint 1',
    year: 2024,
    startDate: '2024-01-15',
    endDate: '2024-02-16',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 160,
    objective: 'Initial core platform foundation, security handshake, and basic merchant onboarding pipeline.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Legacy database migration latency; resolved during phase 8.',
    dependencies: 'Corporate IAM Gateway v1.0',
    remarks: 'Successfully deployed and transitioned to live merchant pilots.',
    phases: createPhases('2024-01-15', '2024-02-16', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-2',
    number: 2,
    name: 'Sprint 2',
    year: 2024,
    startDate: '2024-02-19',
    endDate: '2024-03-22',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 160,
    objective: 'AYO Toko order management flow enhancement and initial CITA reconciliation microservices.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Third-party payment gateway downtime during UAT.',
    dependencies: 'Banking Partner Webhook API',
    remarks: 'Achieved 96% planned mandays delivery.',
    phases: createPhases('2024-02-19', '2024-03-22', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-3',
    number: 3,
    name: 'Sprint 3',
    year: 2024,
    startDate: '2024-03-25',
    endDate: '2024-04-26',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 170,
    objective: 'Principal catalog consolidation and regional sales route optimization for AYO Principal.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'GPS sync accuracy across remote distributor warehouses.',
    dependencies: 'Google Maps Geocoding Quota Increase',
    remarks: 'Zero critical regressions post deployment.',
    phases: createPhases('2024-03-25', '2024-04-26', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-4',
    number: 4,
    name: 'Sprint 4',
    year: 2024,
    startDate: '2024-04-29',
    endDate: '2024-05-31',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 175,
    objective: 'AYO Kasir offline POS sync resilience, barcode fast scan engine, and cash drawer hardware drivers.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Bluetooth peripheral incompatibility on older Android POS hardware.',
    dependencies: 'Hardware OEM Firmware Patch',
    remarks: 'POS stability rated 99.8% in pilot testing.',
    phases: createPhases('2024-04-29', '2024-05-31', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-5',
    number: 5,
    name: 'Sprint 5',
    year: 2024,
    startDate: '2024-06-03',
    endDate: '2024-07-05',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 180,
    objective: 'DTE trade marketing incentives engine, tier upgrade automation, and audit logging overhaul.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Calculation complexity under high-volume end-of-month reconciliation.',
    dependencies: 'SAP Revenue Accounting Module',
    remarks: 'Carried over 2 heavy calculation tickets to Sprint 6 due to accounting validation.',
    phases: createPhases('2024-06-03', '2024-07-05', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-6',
    number: 6,
    name: 'Sprint 6',
    year: 2024,
    startDate: '2024-07-08',
    endDate: '2024-08-09',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 180,
    objective: 'MyHero mobile revamp, field officer gamification points, and real-time attendance beacon sync.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Location spoofing prevention algorithm tuning.',
    dependencies: 'Security Compliance Audit Pass',
    remarks: 'Completed on schedule with 180 planned mandays utilized.',
    phases: createPhases('2024-07-08', '2024-08-09', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-7',
    number: 7,
    name: 'Sprint 7',
    year: 2024,
    startDate: '2024-08-12',
    endDate: '2024-09-13',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 185,
    objective: 'Commercial analytics dashboard v2, automated distributor credit scoring, and multi-tier discounting.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Credit risk rules definition changes during mid-sprint.',
    dependencies: 'Credit Bureau API integration',
    remarks: '3 tickets carried over to Sprint 8 due to late business requirement amendments.',
    phases: createPhases('2024-08-12', '2024-09-13', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-8',
    number: 8,
    name: 'Sprint 8',
    year: 2024,
    startDate: '2024-09-16',
    endDate: '2024-10-18',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 190,
    objective: 'Complete Sprint 8 Backlog Tracker scope: Commercial discounting rules, OSEM dispatch, and wholesale pricing.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Cross-platform inventory contention resolved through distributed locking.',
    dependencies: 'Oracle ERP Maintenance Window',
    remarks: 'Master Excel tracker baseline successfully migrated into Kanvelo.',
    phases: createPhases('2024-09-16', '2024-10-18', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-9',
    number: 9,
    name: 'Sprint 9',
    year: 2024,
    startDate: '2024-10-21',
    endDate: '2024-11-22',
    status: SPRINT_STATUSES.COMPLETED,
    currentPhase: 'Release Note',
    capacity: 195,
    objective: 'AYO Mitra loyalty tier expansion, push notification orchestrator, and real-time inventory telemetry.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Push notification queue throughput during peak flash sales.',
    dependencies: 'Firebase Cloud Messaging High-Priority Tier',
    remarks: '100% deployment rate with high velocity across all platforms.',
    phases: createPhases('2024-10-21', '2024-11-22', 10, SPRINT_STATUSES.COMPLETED)
  },
  {
    id: 'sprint-10',
    number: 10,
    name: 'Sprint 10',
    year: 2025,
    startDate: '2024-11-25',
    endDate: '2025-01-10',
    status: SPRINT_STATUSES.ACTIVE,
    currentPhase: 'Development',
    capacity: 200,
    objective: 'Q1 Enterprise scale stabilization, unified single-sign-on (SSO), and cross-sprint pipeline optimization.',
    owner: 'Inna MP',
    health: SPRINT_HEALTH.ON_TRACK,
    keyRisks: 'Cross-sprint carry-over backlog from Sprint 9 requiring strict WIP limits during code review.',
    dependencies: 'Sampoerna Enterprise Active Directory Modernization',
    remarks: 'Active sprint in flight. Phase 8 (Development) is currently 65% complete.',
    phases: createPhases('2024-11-25', '2025-01-10', 7, SPRINT_STATUSES.ACTIVE)
  }
];
