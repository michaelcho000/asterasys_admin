// Application Constants

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/authentication/login',
  REGISTER: '/authentication/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Applications
  CALENDAR: '/applications/calendar',
  CHAT: '/applications/chat',
  EMAIL: '/applications/email',
  NOTES: '/applications/notes',
  TASKS: '/applications/tasks',
  STORAGE: '/applications/storage',
  
  // CRM
  CUSTOMERS: '/customers',
  CUSTOMERS_VIEW: '/customers/view',
  CUSTOMERS_CREATE: '/customers/create',
  LEADS: '/leads',
  LEADS_VIEW: '/leads/view',
  LEADS_CREATE: '/leads/create',
  
  // Projects
  PROJECTS: '/projects',
  PROJECTS_VIEW: '/projects/view',
  PROJECTS_CREATE: '/projects/create',
  
  // Proposals
  PROPOSALS: '/proposals',
  PROPOSALS_VIEW: '/proposals/view',
  PROPOSALS_CREATE: '/proposals/create',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_BY_ID: (id) => `/projects/${id}`,
  
  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id) => `/tasks/${id}`,
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,
  
  // Leads
  LEADS: '/leads',
  LEAD_BY_ID: (id) => `/leads/${id}`,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const PROJECT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost',
};

export const DATE_FORMAT = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};