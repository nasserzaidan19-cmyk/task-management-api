//DOMAIN ENTITIES

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // hex color code
}

export interface ProjectTag {
  projectId: string;
  tagId: string;
}

export interface TaskAssignee {
  taskId: string;
  userId: string;
  assignedAt: Date;
}

// ENUMS

export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// CREATE/UPDATE DTOs

export type CreateUserDto = Omit<User, "id" | "createdAt">;
export type UpdateUserDto = Partial<Omit<User, "id" | "createdAt">>;

export type CreateProjectDto = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type UpdateProjectDto = Partial<
  Omit<Project, "id" | "ownerId" | "cretedAt" | "updatedAt">
>;

export type CreateTaskDto = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskDto = Partial<
  Omit<Task, "id" | "projectId" | "cretedAt" | "updatedAt">
>;

export type CreateCommentDto = Omit<Comment, "id" | "createdAt">;
export type UpdateCommentDto = Pick<Comment, "content">;

export type CreateTagDto = Omit<Tag, "id">;
export type UpdateTagDto = Partial<Omit<Tag, "id">>;

// PAGINATION & SORTING

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface QueryPrams extends PaginationParams, SortParams {
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// REPOSITORY INTERFACES

export interface BaseRepository<T, CreateDto, UpdateDto> {
  create(date: CreateDto): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(params?: QueryPrams): Promise<PaginatedResponse<T>>;
  update(id: string, date: UpdateDto): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filters?: any): Promise<number>;
}
