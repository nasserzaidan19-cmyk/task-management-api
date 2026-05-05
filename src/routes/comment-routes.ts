import { FastifyInstance } from "fastify";
import { CommentService } from "../services/comment-service";
import {
  createCommentSchema,
  paginationQuerySchema,
  updateCommentSchema,
} from "../schemas/validation-schemas";

export async function commentRoutes(
  fastifiy: FastifyInstance,
  opts: { sharedCommentService: CommentService },
) {
  const commentService = opts.sharedCommentService;

  fastifiy.post("/comments", async (request, reply) => {
    const validatedData = createCommentSchema.parse(request.body);
    const comment = await commentService.create(validatedData);
    return reply.status(201).send(comment);
  });
  fastifiy.patch("/comments/:id", async (request) => {
    const { id } = request.params as { id: string };
    const validatedData = updateCommentSchema.parse(request.body);
    const comment = await commentService.update(id, validatedData);
    return comment;
  });

  fastifiy.get("/comments/:taskId/tasks", async (request) => {
    const { taskId } = request.params as { taskId: string };
    const validatedQuery = paginationQuerySchema.parse(request.query);
    const comments = await commentService.findByTaskId(taskId, validatedQuery);
    return comments;
  });

  fastifiy.get("/comments/:authorId/users", async (request) => {
    const { authorId } = request.params as { authorId: string };
    const validatedQuery = paginationQuerySchema.parse(request.query);
    const comments = await commentService.findByAuthorId(authorId, validatedQuery);
    return comments;
  });

  fastifiy.delete("/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await commentService.delete(id);
    return reply.status(204).send();
  });
}
