import { and, desc, eq, SQL, sql } from "drizzle-orm";
import { comments, db, taskAssignees, tasks } from "../db";
import {
  CreateTaskDto,
  Task,
  UpdateTaskDto,
  QueryPrams,
  TaskPriority,
  TaskStatus,
} from "../types";
import { InMemoryRepository } from "./base-repository";

// export class TaskRepository extends InMemoryRepository<
//   Task,
//   CreateTaskDto,
//   UpdateTaskDto
// > {
//   protected applyFilters(items: Task[], params: QueryPrams): Task[] {
//     let filtered = items;

//     if (params.status) {
//       filtered = filtered.filter((task) => task.status === params.status);
//     }

//     if (params.priority) {
//       filtered = filtered.filter((task) => task.priority === params.priority);
//     }

//     if (params.assigneeId) {
//       filtered = filtered.filter(
//         (task) => task.assigneeId === params.assigneeId,
//       );
//     }

//     return filtered;
//   }
// }

export class TaskRepository {
  async create(data: CreateTaskDto): Promise<Task | null> {
    const [task] = await db.insert(tasks).values(data).returning();
    return (task as Task) ?? null;
  }

  async findById(id: string): Promise<Task> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task as Task;
  }

  async findAll(
    query: QueryPrams,
  ): Promise<{ paginatedTasks: Task[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.status) {
      conditions.push(eq(tasks.status, query.status as TaskStatus));
    }

    if (query.priority) {
      conditions.push(eq(tasks.priority, query.priority as TaskPriority));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, totalResult] = [
      await db
        .select()
        .from(tasks)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(tasks.createdAt)),

      await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(whereClause),
    ];

    const total = Number(totalResult[0]?.count || 0);

    return { paginatedTasks: result as Task[], total };
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id));
    return task;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.taskId, id));
      await tx.delete(taskAssignees).where(eq(taskAssignees.taskId, id));
      const result = await tx.delete(tasks).where(eq(tasks.id, id));
      return result.count > 0;
    });

    return deleted;

    // const deleted = await db.delete(tasks).where(eq(tasks.id, id));
    // return deleted.count > 0;
  }
}
