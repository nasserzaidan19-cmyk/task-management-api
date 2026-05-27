import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema/index";
import { CreateUserDto, QueryPrams, UpdateUserDto, User } from "../types";

/*
this is when we was using the InMemoryRepository
export class UserRepository extends InMemoryRepository<User, CreateUserDto, UpdateUserDto> {
  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.store.values());
    return users.find((user) => user.email === email) || null;
  }
}
*/

export class UserRepository {
  async create(data: CreateUserDto): Promise<User> {
    const [userData] = await db.insert(user).values(data).returning();
    return userData;
  }

  async findById(id: string): Promise<User | null> {
    const [userData] = await db.select().from(user).where(eq(user.id, id));
    return userData ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));
    return userData ?? null;
  }

  async findAll(
    params?: QueryPrams,
  ): Promise<{ paginatedUsers: User[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    const offset = (page - 1) * limit;

    const paginatedUsers = await db
      .select()
      .from(user)
      .limit(limit)
      .offset(offset)
      .orderBy(user.createdAt);

    const [totalCount] = await db.select({ count: sql`count(*)` }).from(user);

    return { paginatedUsers, total: Number(totalCount.count) };
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const [userData] = await db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning();
    return userData;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(user).where(eq(user.id, id));
    return result.count > 0;
  }
}
