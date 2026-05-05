import { FastifyInstance } from "fastify";
import { TagRepository } from "../repositories/tag-repository";
import { TagService } from "../services/tag-service";
import {
  createTagSchema,
  paginationQuerySchema,
  updateTagSchema,
} from "../schemas/validation-schemas";

export async function tagRoutes(
  fastify: FastifyInstance,
  opts: { sharedTagService: TagService },
) {
  const tagService = opts.sharedTagService;

  fastify.post("/tags", async (request, reply) => {
    const validatedData = createTagSchema.parse(request.body);
    const tag = await tagService.create(validatedData);
    return reply.status(201).send(tag);
  });

  fastify.patch("/tags/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const validatedData = updateTagSchema.parse(request.body);
    const tag = await tagService.update(id, validatedData);
    return reply.status(200).send(tag);
  });

  fastify.get("/tags/:id", async (request) => {
    const { id } = request.params as { id: string };
    const result = await tagService.findById(id);
    return result;
  });

  fastify.get("/tags", async (request) => {
    const validatedQuery = paginationQuerySchema.parse(request.query);
    const result = await tagService.findAll(validatedQuery);
    return result;
  });

  fastify.delete("/tags/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await tagService.delete(id);
    return reply.status(204).send();
  });
}
