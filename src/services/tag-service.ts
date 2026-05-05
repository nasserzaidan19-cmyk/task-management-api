import { TagRepository } from "../repositories/tag-repository";
import { CreateTagDto, UpdateTagDto, QueryPrams } from "../types";
import { NotFoundError, ConflictError } from "../utils/errors";
import {
  createPaginatedResponse,
  extractPaginationParams,
} from "../utils/pagination";

export class TagService {
  constructor(private tagRepository: TagRepository) {}
  async create(data: CreateTagDto) {
    const normalizeName = data.name.trim().toLowerCase();
    const existing = await this.tagRepository.findByName(normalizeName);
    if (existing) {
      throw new ConflictError(`Tag with name ${data.name} already exists`);
    }
    return await this.tagRepository.create({
      ...data,
      name: data.name.trim(),
    });
  }

  async update(id: string, data: UpdateTagDto) {
    const existingTag = await this.tagRepository.findById(id);
    if (!existingTag) {
      throw new NotFoundError("Tag", id);
    }
    if (
      data.name &&
      data.name.toLowerCase() !== existingTag.name.toLowerCase()
    ) {
      const nameConflict = await this.tagRepository.findByName(
        data.name.toLowerCase(),
      );
      if (nameConflict) {
        throw new ConflictError(
          `Cannot rename to "${data.name}"; name already in use`,
        );
      }
    }
    return await this.tagRepository.update(id, data);
  }

  async findAll(query: QueryPrams) {
    const { page, limit } = extractPaginationParams(query);
    const { paginatedTags, total } = await this.tagRepository.findAll(query);

    return createPaginatedResponse(paginatedTags, total, page, limit);
  }

  async findById(id: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag", id);
    }
    return tag;
  }

  async delete(id: string) {
    const deleted = this.tagRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Tag", id);
    }
    return { success: true };
  }
}
