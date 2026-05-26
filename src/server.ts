import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "./config/env";
import { errorHandler } from "./utils/error-handler";
import { userRoutes } from "./routes/user-routes";
import { projectRoutes } from "./routes/project-routes";
import { UserRepository } from "./repositories/user-repository";
import { ProjectRepository } from "./repositories/project-repository";
import { TagRepository } from "./repositories/tag-repository";
import { TaskRepository } from "./repositories/task-repository";
import { tagRoutes } from "./routes/tags-routes";
import { UserService } from "./services/user-service";
import { ProjectService } from "./services/project-service";
import { TagService } from "./services/tag-service";
import { TaskService } from "./services/task-service";
import { taskRoutes } from "./routes/task-routes";
import { CommentService } from "./services/comment-service";
import { CommentRepository } from "./repositories/comment-repository";
import { commentRoutes } from "./routes/comment-routes";
import { TaskAssigneeRepository } from "./repositories/TaskAssigneeRepository";

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "info" : "error",
  },
});

//repositoris

const userRepo = new UserRepository();
const projectRepo = new ProjectRepository();
const tagRepo = new TagRepository();
const taskRepo = new TaskRepository();
const commentRepo = new CommentRepository();
const taskAssigneeRepo = new TaskAssigneeRepository();

//services

const sharedUserService = new UserService(userRepo);
const sharedProjectService = new ProjectService(projectRepo, tagRepo, userRepo);
const sharedTaskService = new TaskService(
  taskRepo,
  projectRepo,
  userRepo,
  taskAssigneeRepo,
);
const sharedTagService = new TagService(tagRepo);
const sharedCommentService = new CommentService(
  commentRepo,
  taskRepo,
  userRepo,
);

// registeration

fastify.setErrorHandler(errorHandler);
fastify.register(userRoutes, { sharedUserService });
fastify.register(projectRoutes, {
  sharedProjectService,
  sharedTaskService,
});
fastify.register(tagRoutes, { sharedTagService });
fastify.register(taskRoutes, { sharedTaskService });
fastify.register(commentRoutes, { sharedCommentService });

fastify.get("/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    });
    await fastify.register(helmet);

    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`server running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
