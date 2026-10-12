/**
 * Complete Column Definitions matching the Sprint 8 Excel Sheet
 * (37 distinct Excel columns + app interaction columns)
 */

export const SPRINT_COLUMN_CATEGORIES = {
  CORE: 'Core Info',
  BUSINESS: 'Business & Requirements',
  GOVERNANCE: 'Prioritization & Governance',
  DEV: 'Sprint & Development',
  MANDAYS: 'Mandays & Effort',
  DATES: 'Timeline & Dates',
  REMARKS: 'Artifacts & Remarks'
};

export const SPRINT_ALL_COLUMNS = [
  // --- CORE INFO ---
  {
    key: 'no',
    label: 'No',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 60,
    isSticky: true,
    align: 'center',
    type: 'text'
  },
  {
    key: 'ticket_code',
    label: 'Ticket Code',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 130,
    isSticky: true,
    type: 'code'
  },
  {
    key: 'title', // maps to epic or title
    label: 'Title / Epic',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 280,
    isSticky: true,
    type: 'title'
  },
  {
    key: 'platform',
    label: 'Platform',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 140,
    type: 'platform'
  },
  {
    key: 'sub_platform',
    label: 'Sub-Platform',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: true,
    minWidth: 130,
    type: 'text'
  },
  {
    key: 'assignee',
    label: 'Assignee / PM',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 150,
    type: 'assignee'
  },
  {
    key: 'priority',
    label: 'Priority',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 110,
    type: 'priority'
  },
  {
    key: 'stage',
    label: 'Stage',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 120,
    type: 'stage'
  },
  {
    key: 'progress',
    label: 'Progress',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 120,
    type: 'progress'
  },
  {
    key: 'mandays',
    label: 'Mandays',
    category: SPRINT_COLUMN_CATEGORIES.CORE,
    defaultVisible: true,
    minWidth: 90,
    align: 'center',
    type: 'text'
  },

  // --- BUSINESS & REQUIREMENTS ---
  {
    key: 'business_owner_pic',
    label: 'Business Owner PIC',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: true,
    minWidth: 160,
    type: 'text'
  },
  {
    key: 'category',
    label: 'Category',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: true,
    minWidth: 130,
    type: 'text'
  },
  {
    key: 'impact',
    label: 'Impact (Number)',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: false,
    minWidth: 130,
    type: 'text'
  },
  {
    key: 'background',
    label: 'Background',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: false,
    minWidth: 240,
    type: 'text'
  },
  {
    key: 'objective',
    label: 'Objective',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: false,
    minWidth: 240,
    type: 'text'
  },
  {
    key: 'description',
    label: 'Description',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: false,
    minWidth: 260,
    type: 'text'
  },
  {
    key: 'changes_principal_role',
    label: 'Changes Principal Role',
    category: SPRINT_COLUMN_CATEGORIES.BUSINESS,
    defaultVisible: false,
    minWidth: 180,
    type: 'text'
  },

  // --- PRIORITIZATION & GOVERNANCE ---
  {
    key: 'proposal_prio_rank',
    label: 'Proposal Prio Rank',
    category: SPRINT_COLUMN_CATEGORIES.GOVERNANCE,
    defaultVisible: false,
    minWidth: 140,
    type: 'text'
  },
  {
    key: 'final_prio_rank',
    label: 'Final Prio Rank',
    category: SPRINT_COLUMN_CATEGORIES.GOVERNANCE,
    defaultVisible: false,
    minWidth: 130,
    type: 'text'
  },
  {
    key: 'prev_prio',
    label: 'Prev Prio',
    category: SPRINT_COLUMN_CATEGORIES.GOVERNANCE,
    defaultVisible: false,
    minWidth: 110,
    type: 'text'
  },
  {
    key: 'shared_product_team',
    label: 'Shared to Product Team',
    category: SPRINT_COLUMN_CATEGORIES.GOVERNANCE,
    defaultVisible: false,
    minWidth: 170,
    type: 'text'
  },

  // --- SPRINT & DEV ---
  {
    key: 'final_dev_status',
    label: 'Final Dev Status',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 160,
    type: 'badge'
  },
  {
    key: 'develop_in_sprint',
    label: 'Develop in Sprint?',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 140,
    type: 'text'
  },
  {
    key: 'cross_sprint',
    label: 'Cross Sprint?',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 120,
    type: 'text'
  },
  {
    key: 'cross_sprint_to',
    label: 'Cross Sprint To?',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 140,
    type: 'text'
  },
  {
    key: 'ticket_1st_shown',
    label: 'Ticket 1st Shown in Sprint',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 170,
    type: 'text'
  },
  {
    key: 'start_dev_in_sprint',
    label: 'Start Dev in Sprint',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 160,
    type: 'text'
  },
  {
    key: 'reason_cancel_deprio',
    label: 'Reason Cancel / Deprio',
    category: SPRINT_COLUMN_CATEGORIES.DEV,
    defaultVisible: false,
    minWidth: 190,
    type: 'text'
  },

  // --- MANDAYS & EFFORT ---
  {
    key: 'weight_mandays',
    label: 'Weight (Mandays)',
    category: SPRINT_COLUMN_CATEGORIES.MANDAYS,
    defaultVisible: false,
    minWidth: 130,
    align: 'center',
    type: 'text'
  },
  {
    key: 'mandays_consumption_se',
    label: 'Mandays (SE)',
    category: SPRINT_COLUMN_CATEGORIES.MANDAYS,
    defaultVisible: false,
    minWidth: 120,
    align: 'center',
    type: 'text'
  },
  {
    key: 'mandays_consumption_itpd',
    label: 'Mandays (ITPD)',
    category: SPRINT_COLUMN_CATEGORIES.MANDAYS,
    defaultVisible: false,
    minWidth: 130,
    align: 'center',
    type: 'text'
  },

  // --- DATES & TIMELINE ---
  {
    key: 'brd_submission_date',
    label: 'BRD Submission Date',
    category: SPRINT_COLUMN_CATEGORIES.DATES,
    defaultVisible: false,
    minWidth: 150,
    type: 'date'
  },
  {
    key: 'prd_creation_date',
    label: 'PRD Creation Date',
    category: SPRINT_COLUMN_CATEGORIES.DATES,
    defaultVisible: false,
    minWidth: 150,
    type: 'date'
  },
  {
    key: 'date_sharing_req_se',
    label: 'Date Sharing Req (SE)',
    category: SPRINT_COLUMN_CATEGORIES.DATES,
    defaultVisible: false,
    minWidth: 160,
    type: 'date'
  },
  {
    key: 'uat_date',
    label: 'UAT Date',
    category: SPRINT_COLUMN_CATEGORIES.DATES,
    defaultVisible: false,
    minWidth: 120,
    type: 'date'
  },
  {
    key: 'deployment_date',
    label: 'Deployment Date',
    category: SPRINT_COLUMN_CATEGORIES.DATES,
    defaultVisible: false,
    minWidth: 140,
    type: 'date'
  },

  // --- ARTIFACTS & REMARKS ---
  {
    key: 'jira_ticket_number',
    label: 'Jira Ticket Number',
    category: SPRINT_COLUMN_CATEGORIES.REMARKS,
    defaultVisible: false,
    minWidth: 140,
    type: 'code'
  },
  {
    key: 'total_tickets_generated',
    label: '# Total Tickets',
    category: SPRINT_COLUMN_CATEGORIES.REMARKS,
    defaultVisible: false,
    minWidth: 130,
    align: 'center',
    type: 'text'
  },
  {
    key: 'brd',
    label: 'BRD Document',
    category: SPRINT_COLUMN_CATEGORIES.REMARKS,
    defaultVisible: false,
    minWidth: 140,
    type: 'link'
  },
  {
    key: 'final_remarks',
    label: 'Final Remarks',
    category: SPRINT_COLUMN_CATEGORIES.REMARKS,
    defaultVisible: false,
    minWidth: 180,
    type: 'text'
  },
  {
    key: 'remark',
    label: 'Remark',
    category: SPRINT_COLUMN_CATEGORIES.REMARKS,
    defaultVisible: false,
    minWidth: 180,
    type: 'text'
  }
];

export const COLUMN_PRESETS = {
  DEFAULT: {
    id: 'default',
    label: 'Default View (12 cols)',
    keys: SPRINT_ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key)
  },
  CORE: {
    id: 'core',
    label: 'Core View',
    keys: ['no', 'ticket_code', 'title', 'platform', 'assignee', 'priority', 'stage', 'progress', 'mandays']
  },
  BUSINESS: {
    id: 'business',
    label: 'Business & Requirements',
    keys: ['no', 'ticket_code', 'title', 'sub_platform', 'business_owner_pic', 'category', 'impact', 'brd_submission_date', 'assignee', 'brd']
  },
  DEV: {
    id: 'dev',
    label: 'Development & Engineering',
    keys: ['no', 'ticket_code', 'title', 'platform', 'final_dev_status', 'develop_in_sprint', 'cross_sprint', 'cross_sprint_to', 'mandays_consumption_se', 'mandays_consumption_itpd', 'deployment_date', 'jira_ticket_number']
  },
  ALL: {
    id: 'all',
    label: 'All Columns (37+)',
    keys: SPRINT_ALL_COLUMNS.map(c => c.key)
  }
};
