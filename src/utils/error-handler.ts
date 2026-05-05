import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError, ValidationError, ErrorResponse } from "./errors";
import { env } from "../config/env";

export const errorHandler = (
  error: FastifyError | ZodError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error({
    err: error,
    url: request.url,
    method: request.method,
  });

  // Handle Zod validation errors

  if (error instanceof ZodError) {
    const validationError: ErrorResponse = {
      error: {
        message: "Validation failed",
        statusCode: 400,
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
    return reply.status(400).send(validationError);
  }

  // Handle custom app errors

  if (error instanceof AppError) {
    const appError: ErrorResponse = {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError &&
          error.details && {
            details: error.details,
          }),
      },
    };
    if (env.NODE_ENV === "development") {
      appError.error.stack = error.stack;
    }

    return reply.status(error.statusCode).send(appError);
  }

  // Handle Fastify errors (built-in validation, etc.)

  if ("statusCode" in error) {
    const fastifyError: ErrorResponse = {
      error: {
        message: error.message,
        statusCode: error.statusCode || 500,
      },
    };
    if (env.NODE_ENV === "development") {
      fastifyError.error.stack = error.stack;
    }

    return reply.status(error.statusCode || 500).send(fastifyError);
  }

  // Handle unexpected errors

  const unexpectedError: ErrorResponse = {
    error: {
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
      statusCode: 500,
    },
  };
  if (env.NODE_ENV === "development") {
    unexpectedError.error.stack = error.stack;
  }
  return reply.status(500).send(unexpectedError);
};
