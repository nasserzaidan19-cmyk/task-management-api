import { eq, sql } from "drizzle-orm";
import { comments, db } from "../db";
import {
  Comment,
  CreateCommentDto,
  QueryPrams,
  UpdateCommentDto,
} from "../types";
import { InMemoryRepository } from "./base-repository";

// export class CommentRepository extends InMemoryRepository<
//   Comment,
//   CreateCommentDto,
//   UpdateCommentDto
// > {
//   async findByTaskId(taskId: string): Promise<Comment[]> {
//     const comments = Array.from(this.store.values());
//     return comments.filter((comment) => comment.taskId === taskId);
//   }

//   async findByAuthorId(authorId: string): Promise<Comment[]> {
//     const comments = Array.from(this.store.values());
//     return comments.filter((comment) => comment.authorId === authorId);
//   }
// }

export class CommentRepository {
  async create(data: CreateCommentDto): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }
  async findById(id: string): Promise<Comment> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    return comment;
  }

  async findByTaskId(
    id: string,
    query: QueryPrams,
  ): Promise<{ comments: Comment[] | null; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(comments)
      .limit(limit)
      .offset(offset)
      .where(eq(comments.taskId, id));

    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(comments)
      .where(eq(comments.taskId, id));

    return { comments: result ?? null, total: Number(totalCount.count) };
  }

  async findByAuthorId(
    id: string,
    query: QueryPrams,
  ): Promise<{ comments: Comment[] | null; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(comments)
      .limit(limit)
      .offset(offset)
      .where(eq(comments.authorId, id));

    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(comments)
      .where(eq(comments.authorId, id));

    return { comments: result ?? null, total: Number(totalCount.count) };
  }

  async update(id: string, data: UpdateCommentDto): Promise<Comment> {
    const [comment] = await db
      .update(comments)
      .set(data)
      .where(eq(comments.id, id))
      .returning();

    return comment;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return deleted.length > 0;
  }
}
