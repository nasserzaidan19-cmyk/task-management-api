import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {user} from "../db/schema/auth-schema"
import {taskAssignees} from "../db/schema/schema"


import { ConflictError } from "../utils/errors";

export class TaskAssigneeRepository {
  async assignTask(taskId: string, userId: string): Promise<void> {
    try {
      await db.insert(taskAssignees).values({ taskId, userId });
    }
    catch(error){
      throw new ConflictError("This user is already assigned to this task");
    }
  }

  async unassignTask(taskId: string, userId: string): Promise<Boolean> {
    const result = await db
      .delete(taskAssignees)
      .where(
        and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId)),
      );
    return result.count > 0;
  }

  async getTaskAssignees(
    taskId: string,
  ): Promise<{ id: string; name: string; userEmail: string }[]> {
    const result = await db
      .select({ id: user.id, name: user.name, userEmail: user.email })
      .from(taskAssignees)
      .innerJoin(user, eq(taskAssignees.userId, user.id))
      .where(eq(taskAssignees.taskId, taskId));

    return result;
  }

  async assignTaskExisting(taskId: string, userId: string) {
    const [result] = await db
      .select()
      .from(taskAssignees)
      .where(
        and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId)),
      )
      .limit(1);

    return !!result;
  }
}

/*

export class TaskAssigneeRepository extends JunctionTableRepository {
  async assignTask(taskId: string, userId: string): Promise<void> {
    return await this.add(taskId, userId);
  }

  async unassignTask(taskId: string, userId: string): Promise<Boolean> {
    return await this.remove(taskId, userId);
  }

  async getTaskAssignees(taskId: string): Promise<string[]> {
    return await this.findByFirst(taskId);
  }

  async assignTaskExisting(taskId: string, userId: string) {
    return await this.exists(taskId, userId);
  }
}

*/
