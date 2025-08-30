export interface Task {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  estimatedHours?: number;
  actualHours: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  dependencies: string[]; // task IDs
  attachments: TaskAttachment[];
  comments: TaskComment[];
  timeEntries: string[]; // time entry IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  attachments: string[]; // attachment IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'blocked_by' | 'relates_to';
  createdAt: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  TESTING = 'testing',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskType {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  TASK = 'task',
  STORY = 'story',
  EPIC = 'epic'
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  estimatedHours?: {
    min?: number;
    max?: number;
  };
}

export interface TaskSort {
  field: 'name' | 'status' | 'priority' | 'dueDate' | 'estimatedHours' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface TaskBulkUpdate {
  taskIds: string[];
  updates: Partial<Pick<Task, 'status' | 'priority' | 'assigneeId' | 'dueDate' | 'tags'>>;
}
