import { CommentRepository } from "../repositories/comment-repository";
import { UserRepository } from "../repositories/user-repository";
import { TaskRepository } from "../repositories/task-repository";
import { NotFoundError } from "../utils/errors";
import { CreateCommentDto, UpdateCommentDto, QueryPrams } from "../types";
import {
  createPaginatedResponse,
  extractPaginationParams,
  paginateArray,
} from "../utils/pagination";

export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private taskRepository: TaskRepository,
    private userRepository: UserRepository,
  ) {}

  async create(data: CreateCommentDto) {
    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new NotFoundError("Task", data.taskId);
    }

    const author = await this.userRepository.findById(data.authorId);
    if (!author) {
      throw new NotFoundError("User", data.authorId);
    }
    return this.commentRepository.create(data);
  }

  async findByTaskId(taskId: string, query: QueryPrams) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task", taskId);
    }

    const { page, limit } = extractPaginationParams(query);
    const { comments, total } = await this.commentRepository.findByTaskId(
      taskId,
      query,
    );

    return createPaginatedResponse(comments ?? [], total, page, limit);
  }

  async findByAuthorId(authorId: string, query: QueryPrams) {
    const author = await this.userRepository.findById(authorId);
    if (!author) throw new NotFoundError("Author", authorId);
    const { page, limit } = extractPaginationParams(query);
    const { comments, total } = await this.commentRepository.findByAuthorId(
      authorId,
      query,
    );

    return createPaginatedResponse(comments ?? [], total, page, limit);
  }

  async update(id: string, data: UpdateCommentDto) {
    const existing = await this.commentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Comment", id);
    }
    return await this.commentRepository.update(id, data);
  }
  async delete(id: string) {
    const deleted = await this.commentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Comment", id);
    }
    return { success: true };
  }
}
