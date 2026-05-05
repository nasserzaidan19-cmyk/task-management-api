import { UserRepository } from "../repositories/user-repository";
import { CreateUserDto, UpdateUserDto, QueryPrams } from "../types";
import { NotFoundError, ConflictError } from "../utils/errors";
import {
  createPaginatedResponse,
  extractPaginationParams,
} from "../utils/pagination";

export class UserService {
  constructor(private userRepository: UserRepository) {}
  async create(data: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("User with this email already exists");
    }
    return this.userRepository.create(data);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }
    return user;
  }

  async findAll(quary: QueryPrams) {
    const { page, limit } = extractPaginationParams(quary);
    const { paginatedUsers, total } = await this.userRepository.findAll(quary);

    return createPaginatedResponse(paginatedUsers, total, page, limit);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User", email);
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User", id);
    }
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new ConflictError("User with this email already exists");
      }
    }
    return this.userRepository.update(id, data);
  }

  async delete(id: string) {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("User", id);
    }
    return { success: true };
  }
}
