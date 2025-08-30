export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  billable: boolean;
  hourlyRate?: number;
  currency: string;
  tags: string[];
  location?: string;
  device?: string;
  activity?: string;
  notes?: string;
  isRunning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntryStart {
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  billable: boolean;
  hourlyRate?: number;
  tags: string[];
  location?: string;
  device?: string;
}

export interface TimeEntryStop {
  id: string;
  endTime: Date;
  notes?: string;
}

export interface TimeEntryUpdate {
  id: string;
  description?: string;
  billable?: boolean;
  hourlyRate?: number;
  tags?: string[];
  notes?: string;
}

export interface TimeEntryFilter {
  userId?: string;
  projectId?: string;
  taskId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  billable?: boolean;
  tags?: string[];
  minDuration?: number;
  maxDuration?: number;
}

export interface TimeEntrySummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalAmount: number;
  currency: string;
  entries: TimeEntry[];
}

export interface DailyTimeEntry {
  date: Date;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  entries: TimeEntry[];
}

export interface WeeklyTimeEntry {
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  dailyEntries: DailyTimeEntry[];
}

export interface MonthlyTimeEntry {
  month: number;
  year: number;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  weeklyEntries: WeeklyTimeEntry[];
}

export interface TimeTrackingSettings {
  autoStart: boolean;
  autoStop: boolean;
  reminderInterval: number; // minutes
  breakReminders: boolean;
  idleDetection: boolean;
  idleTimeout: number; // minutes
  roundingRules: TimeRoundingRule[];
  defaultBillable: boolean;
  defaultHourlyRate?: number;
}

export interface TimeRoundingRule {
  id: string;
  name: string;
  roundTo: number; // minutes
  threshold: number; // minutes
  enabled: boolean;
}

export interface TimeEntryExport {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: {
    from: Date;
    to: Date;
  };
  includeDetails: boolean;
  groupBy: 'day' | 'week' | 'month' | 'project' | 'task';
  filters: TimeEntryFilter;
}
