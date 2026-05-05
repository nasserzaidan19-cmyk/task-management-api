import { randomUUID } from "crypto";
import { QueryPrams} from "../types";
import {
  extractSortParams,
  sortArray,
} from "../utils/pagination";

// GENERIC IN-MEMORY REPOSITORY

export abstract class InMemoryRepository<
  TEntity extends { id: string },
  TCreateDto,
  TUpdateDto,
> {
   store = new Map<string, TEntity>();

  async create(data: TCreateDto): Promise<TEntity> {
    const id = randomUUID();
    const now = new Date();

    const entity = {
      ...data,
      id,
      createdAt: now,
      ...(this.hasUpdatedAt() && { updatedAt: now }),
    } as unknown as TEntity;

    this.store.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<TEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(params: QueryPrams = {}): Promise<TEntity[]> {
    let items = Array.from(this.store.values());
    items = this.applyFilters(items, params);

    if (params.sortBy) {
      const { sortBy, order } = extractSortParams(
        params,
        this.getAllowedSortFields(),
        this.getDefaultSortField(),
      );
      items = sortArray(items, sortBy, order);
    }
    return items;
  }

  async count(params: QueryPrams = {}): Promise<number> {
    const items = await this.findAll(params);
    return items.length;
  }

  async update(id: string, data: TUpdateDto): Promise<TEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...data,
      ...(this.hasUpdatedAt() && { updatedAt: new Date() }),
    } as TEntity;

    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  protected applyFilters(items: TEntity[], params: QueryPrams): TEntity[] {
    return items;
  }

  protected getAllowedSortFields(): string[] {
    return ["createdAt"];
  }

  protected getDefaultSortField(): string {
    return "createdAt";
  }

  protected hasUpdatedAt(): boolean {
    return true;
  }
}

// JUNCTION TABLE REPOSITORY

export abstract class JunctionTableRepository {
  protected store = new Set<string>();

  private createKey(firstId: string, secondId: string): string {
    return `${firstId}:${secondId}`;
  }

  async add(firstId: string, secondId: string): Promise<void> {
    this.store.add(this.createKey(firstId, secondId));
  }

  async remove(firstId: string, secondId: string): Promise<boolean> {
    return this.store.delete(this.createKey(firstId, secondId));
  }

  async exists(firstId: string, secondId: string): Promise<boolean> {
    return this.store.has(this.createKey(firstId, secondId));
  }

  //Gets all second IDs associated with a first ID

  async findByFirst(firstId: string): Promise<string[]> {
    const prefix = `${firstId}:`;
    return Array.from(this.store)
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.split(":")[1]);
  }

  //Gets all first IDs associated with a second ID

  async findBySecond(secondId: string): Promise<string[]> {
    const suffix = `:${secondId}`;
    return Array.from(this.store)
      .filter((key) => key.endsWith(suffix))
      .map((key) => key.split(":")[0]);
  }

  // Removes all relationships for a first Id
  async removeByFirst(firstId: string): Promise<void> {
    const prefix = `${firstId}:`;
    Array.from(this.store)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => this.store.delete(key));
  }

  async removeBySecond(secondId: string): Promise<void> {
    const suffix = `:${secondId}`;

    Array.from(this.store)
      .filter((key) => key.endsWith(suffix))
      .forEach((key) => this.store.delete(key));
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
