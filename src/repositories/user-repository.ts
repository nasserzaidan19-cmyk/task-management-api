import { eq, sql } from "drizzle-orm";
import { db, users } from "../db";
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
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findAll(
    params?: QueryPrams,
  ): Promise<{ paginatedUsers: User[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    const offset = (page - 1) * limit;

    const paginatedUsers = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    const [totalCount] = await db.select({ count: sql`count(*)` }).from(users);

    return { paginatedUsers, total: Number(totalCount.count) };
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }
}
