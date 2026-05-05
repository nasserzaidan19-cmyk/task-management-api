import { FastifyInstance } from "fastify";
import { ProjectService } from "../services/project-service";
import { TaskService } from "../services/task-service";
import {
  createProjectSchema,
  updateProjectSchema,
  addTagToProjectSchema,
  paginationQuerySchema,
  projectQuerySchema,
} from "../schemas/validation-schemas";

export async function projectRoutes(
  fastify: FastifyInstance,
  opts: {
    sharedProjectService: ProjectService;
    sharedTaskService: TaskService;
  },
) {
  const projectService = opts.sharedProjectService;
  const taskService = opts.sharedTaskService;

  // projects

  fastify.post("/projects", async (request, reply) => {
    const validatedData = createProjectSchema.parse(request.body);
    const project = await projectService.create(validatedData);
    return reply.status(201).send(project);
  });

  fastify.get("/projects", async (request) => {
    const validatedQuery = projectQuerySchema.parse(request.query);
    const result = await projectService.findAll(validatedQuery);
    return result;
  });

  fastify.get("/projects/:id", async (request) => {
    const { id } = request.params as { id: string };
    const project = await projectService.findById(id);
    return project;
  });

  fastify.patch("/projects/:id", async (request) => {
    const { id } = request.params as { id: string };
    const validatedData = updateProjectSchema.parse(request.body);
    const project = await projectService.update(id, validatedData);
    return project;
  });

  fastify.delete("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await projectService.delete(id);
    return reply.status(204).send();
  });

  //add tages to project

  fastify.post("/projects/:id/tags", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { tagId } = addTagToProjectSchema.parse(request.body);
    await projectService.addTag(id, tagId);
    return reply.status(201).send({ success: true });
  });

  // Remove tag from project

  fastify.delete("/projects/:id/tags/:tagId", async (request, reply) => {
    const { id, tagId } = request.params as { id: string; tagId: string };
    await projectService.removeTag(id, tagId);
    return reply.status(204).send;
  });

  fastify.get("/projects/:projectId/tasks", async (request) => {
    const { projectId } = request.params as { projectId: string };
    const validatedQuery = paginationQuerySchema.parse(request.query);

    const query = { ...validatedQuery, projectId };
    const result = await taskService.findAll(query);
    return result;
  });
}
