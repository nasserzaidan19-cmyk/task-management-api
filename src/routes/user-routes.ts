import { FastifyInstance } from "fastify";
import { UserService } from "../services/user-service";
import {
  createUserSchema,
  emailSchema,
  paginationQuerySchema,
  updateUserSchema,
} from "../schemas/validation-schemas";

export async function userRoutes(
  fastify: FastifyInstance,
  opts: { sharedUserService: UserService },
) {
  const userService = opts.sharedUserService;

  fastify.get("/users", async (request) => {
    const validatedQuery = paginationQuerySchema.parse(request.query);
    const result = await userService.findAll(validatedQuery);
    return result;
  });

  fastify.get("/users/:id", async (request) => {
    const { id } = request.params as { id: string };
    const user = await userService.findById(id);
    return user;
  });

  fastify.get("/users/by-email/:email", async (request) => {
    const { email } = request.params as { email: string };
    const validatedEmail = emailSchema.parse(email);
    const user = await userService.findByEmail(validatedEmail);
    return user;
  });

  fastify.patch("/users/:id", async (request) => {
    const { id } = request.params as { id: string };
    const validatedData = updateUserSchema.parse(request.body);
    const user = await userService.update(id, validatedData);
    return user;
  });

  fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await userService.delete(id);
    return reply.status(201).send(deleted);
  });
}
