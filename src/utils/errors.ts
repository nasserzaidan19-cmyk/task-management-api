export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract isOperational: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  isOperational = true;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message);
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string, public details?: any) {
    super(message);
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  isOperational = true;

  constructor(message: string = "Access forbidden") {
    super(message);
  }
}

export class InternalServerError extends AppError {
  statusCode = 500;
  isOperational = false;

  constructor(message: string = "Internal server error") {
    super(message);
  }
}

// ERROR RESPONSE INTERFACE

export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
    details?: any;
    stack?: string;
  };
}
