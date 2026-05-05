import { InMemoryRepository } from "./base-repository";
import { CreateTagDto, QueryPrams, Tag, UpdateTagDto } from "../types";
import { db, tags } from "../db";
import { eq, sql } from "drizzle-orm";

// export class TagRepository extends InMemoryRepository<
//   Tag,
//   CreateTagDto,
//   UpdateTagDto
// > {
//   async findByName(name: string): Promise<Tag | null> {
//     const tags = Array.from(this.store.values());
//     return tags.find((tag) => tag.name === name) || null;
//   }

//   async create(data: CreateTagDto): Promise<Tag> {
//     const existing = await this.findByName(data.name);
//     if (existing) {
//       throw new Error(`Tag with name "${data.name}" already exists.`);
//     }

//     return super.create(data);
//   }
// }

export class TagRepository {
  async create(data: CreateTagDto): Promise<Tag> {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  }
  async findByName(name: string): Promise<Tag | null> {
    const [tag] = await db.select().from(tags).where(eq(tags.name, name));
    return tag;
  }

  async findById(id: string): Promise<Tag | null> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag ?? null;
  }

  async findAll(
    params: QueryPrams,
  ): Promise<{ paginatedTags: Tag[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;

    const offset = (page - 1) * limit;

    const paginatedTags = await db
      .select()
      .from(tags)
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql`count(*)` }).from(tags);

    return {
      paginatedTags,
      total: Number(total.count),
    };
  }

  async update(id: string, data: UpdateTagDto): Promise<Tag> {
    const [tag] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.delete(tags).where(eq(tags.id, id)).returning();
    return deleted.length > 0;
  }
}
