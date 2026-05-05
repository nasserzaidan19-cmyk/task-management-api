import { TaskRepository } from "../repositories/task-repository";
import { ProjectRepository } from "../repositories/project-repository";
import { UserRepository } from "../repositories/user-repository";
import {
  CreateTaskDto,
  UpdateTaskDto,
  QueryPrams,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
} from "../types";
import { NotFoundError } from "../utils/errors";
import {
  createPaginatedResponse,
  extractPaginationParams,
  paginateArray,
} from "../utils/pagination";
import { TaskAssigneeRepository } from "../repositories/TaskAssigneeRepository";

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository,
    private taskAssigneeRepository: TaskAssigneeRepository,
  ) {}

  async create(data: CreateTaskDto) {
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError("Project", data.projectId);
    }

    if (data.assigneeId) {
      const user = await this.userRepository.findById(data.assigneeId);
      if (!user) {
        throw new NotFoundError("User", data.assigneeId);
      }
    }
    return await this.taskRepository.create(data);
  }

  async update(id: string, data: UpdateTaskDto) {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Task", id);
    }
    if (data.assigneeId) {
      const user = await this.userRepository.findById(data.assigneeId);
      if (!user) {
        throw new NotFoundError("User", data.assigneeId);
      }
    }
    return await this.taskRepository.update(id, data);
  }

  async findById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task", id);
    }
    return task;
  }

  async findAll(query: QueryPrams) {
    const { page, limit } = extractPaginationParams(query);
    const { paginatedTasks, total } = await this.taskRepository.findAll(query);

    return createPaginatedResponse(paginatedTasks, total, page, limit);
  }

  async delete(id: string) {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Task", id);
    }
    return { success: true };
  }

  // assignee management

  async assignUserToTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task", taskId);

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    await this.taskAssigneeRepository.assignTask(taskId, userId);
  }

  async unassignTask(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task", id);
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User", userId);
    const isAssigned = await this.taskAssigneeRepository.assignTaskExisting(
      id,
      userId,
    );

    if (!isAssigned)
      throw new NotFoundError("Assignment", `${id} -> ${userId}`);
    await this.taskAssigneeRepository.unassignTask(id, userId);
  }

  async getTaskAssignees(taskId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task", taskId);

    return await this.taskAssigneeRepository.getTaskAssignees(taskId);
  }
}
