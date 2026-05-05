import { ProjectRepository } from "../repositories/project-repository";
import { TagRepository } from "../repositories/tag-repository";
import { UserRepository } from "../repositories/user-repository";
import { CreateProjectDto, UpdateProjectDto, QueryPrams } from "../types";
import { NotFoundError } from "../utils/errors";
import {
  createPaginatedResponse,
  extractPaginationParams,
} from "../utils/pagination";

export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private tagRepository: TagRepository,
    private userRepository: UserRepository,
  ) {}

  async create(data: CreateProjectDto) {
    const owner = await this.userRepository.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError("User", data.ownerId);
    }
    return this.projectRepository.create(data);
  }

  async findById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError("Project", id);
    }
    const tags = await this.projectRepository.getProjectTags(id);
    return { ...project, tags };
  }

  async findAll(query: QueryPrams) {
    const { page, limit } = extractPaginationParams(query);
    const { paginatedProjets, total } =
      await this.projectRepository.findAll(query);

    return createPaginatedResponse(paginatedProjets, total, page, limit);
  }

  async update(id: string, data: UpdateProjectDto) {
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Project", id);
    }
    return this.projectRepository.update(id, data);
  }

  async delete(id: string) {
    const deleted = await this.projectRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Project", id);
    }
    return { success: true };
  }

  // tag management

  async addTag(projectId: string, tagId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project", projectId);
    }
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new NotFoundError("Tag", tagId);
    }
    await this.projectRepository.addTag(projectId, tagId);
    return { success: true };
  }

  async removeTag(projectId: string, tagId: string) {
    const removed = await this.projectRepository.removeTag(projectId, tagId);
    if (!removed) {
      throw new NotFoundError("Tag", tagId);
    }
    return { success: true };
  }
}
