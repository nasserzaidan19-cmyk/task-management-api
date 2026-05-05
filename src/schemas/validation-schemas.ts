import z from "zod";
import { ProjectStatus, TaskPriority, TaskStatus } from "../types";

// reusable components

const uuidSchema = z.string().uuid("Invalid UUID format");

export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must be at most 255 characters long");

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code (e.g., #FF5733)");

// User Schemas

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters long"),
  email: emailSchema,
});

export const updateUserSchema = createUserSchema.partial();

// project schemas

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters long"),
  ownerId: uuidSchema,
  status: z
    .enum(["active", "archived", "completed"])
    .default("active") as z.ZodType<ProjectStatus>,
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters long")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters long")
    .optional(),
  status: z
    .enum(["active", "archived", "completed"])
    .default("active")
    .optional() as z.ZodType<ProjectStatus>,
});

// TASK SCHEMAS

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters long"),
  projectId: uuidSchema,
  assigneeId: uuidSchema.nullable(),
  status: z
    .enum(["todo", "in_progress", "done"])
    .default("todo") as z.ZodType<TaskStatus>,
  priority: z
    .enum(["low", "medium", "high"])
    .default("medium") as z.ZodType<TaskPriority>,
  dueDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return null;
  }, z.date().nullable()),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  status: z
    .enum(["todo", "in_progress", "done"])
    .optional() as z.ZodType<TaskStatus>,
  priority: z
    .enum(["low", "medium", "high"])
    .optional() as z.ZodType<TaskPriority>,
  dueDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return null;
  }, z.date().nullable()),
});

// COMMENT SCHEMAS

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be at most 2000 characters long"),
  taskId: uuidSchema,
  authorId: uuidSchema,
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be at most 2000 characters long"),
});

// TAG SCHEMAS

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters long"),
  color: hexColorSchema,
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters long")
    .optional(),
  color: hexColorSchema.optional(),
});

// RELATIONSHIP SCHEMAS

export const addTagToProjectSchema = z.object({
  tagId: uuidSchema,
});

export const assignUserToTaskSchema = z.object({
  userId: uuidSchema,
});

// Query PARAMS SCHEMAS

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const projectQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "archived", "completed"]).optional(),
  ownerId: uuidSchema.optional(),
});

export const taskQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assigneeId: uuidSchema.optional(),
});
