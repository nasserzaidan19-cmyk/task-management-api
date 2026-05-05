import { FastifyInstance } from "fastify";
import { TaskService } from "../services/task-service";
import {
  paginationQuerySchema,
  updateTaskSchema,
  createTaskSchema,
  taskQuerySchema,
} from "../schemas/validation-schemas";
import { CreateTaskDto } from "../types";

export async function taskRoutes(
  fastify: FastifyInstance,
  opts: { sharedTaskService: TaskService },
) {
  const taskService = opts.sharedTaskService;

  fastify.post("/tasks/:projectId", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const validatedData = createTaskSchema.parse({
      ...(request.body as object),
      projectId,
    }) as CreateTaskDto;
    const task = await taskService.create(validatedData);
    return reply.status(201).send(task);
  });

  fastify.patch("/tasks/:id", async (request) => {
    const { id } = request.params as { id: string };
    const validatedData = updateTaskSchema.parse(request.body);
    const task = await taskService.update(id, validatedData);
    return task;
  });

  fastify.get("/tasks", async (request) => {
    const validatedQuery = taskQuerySchema.parse(request.query);
    const result = await taskService.findAll(validatedQuery);
    return result;
  });

  fastify.get("/tasks/:id", async (request) => {
    const { id } = request.params as { id: string };
    const task = await taskService.findById(id);
    return task;
  });

  fastify.delete("/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await taskService.delete(id);
    reply.status(201).send(deleted);
  });

  //assignee routes

  fastify.post("/tasks/:id/assign", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.body as { userId: string };
    await taskService.assignUserToTask(id, userId);

    return reply.status(201).send({ success: true });
  });

  fastify.delete("/tasks/:id/assign/:userId", async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string };
    await taskService.unassignTask(id, userId);
    return reply.status(201).send({ success: true });
  });

  fastify.get("/tasks/:id/users", async (request) => {
    const { id } = request.params as { id: string };
    const assigneesUsers = await taskService.getTaskAssignees(id);
    return assigneesUsers;
  });
}
