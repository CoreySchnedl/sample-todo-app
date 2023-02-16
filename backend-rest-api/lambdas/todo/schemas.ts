import { TodoPriority } from "@shared/enums";
import { createRequestSchema } from "../../utils/schema";

/**
 * Create Todo
 */

export const createTodoRequestBodySchema = {
  type: "object",
  required: ["name", "description", "priority"],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    priority: {
      enum: Object.values(TodoPriority),
    },
  },
} as const;

export const createTodoRequestSchema = createRequestSchema({
  body: createTodoRequestBodySchema,
});

/**
 * Get Todo
 */

export const getTodoRequestPathParameters = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const getTodoRequestSchema = createRequestSchema({
  pathParameters: getTodoRequestPathParameters,
});

/**
 * Update Todo
 */

export const updateTodoRequestBodySchema = {
  type: "object",
  required: ["name", "description", "priority"],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    priority: {
      enum: Object.values(TodoPriority),
    },
  },
} as const;

export const updateTodoRequestPathParameters = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const updateTodoRequestSchema = createRequestSchema({
  body: updateTodoRequestBodySchema,
  pathParameters: updateTodoRequestPathParameters,
});

/**
 * Delete Todo
 */

export const deleteTodoRequestPathParameters = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const deleteTodoRequestSchema = createRequestSchema({
  pathParameters: deleteTodoRequestPathParameters,
});

/**
 * Get Todos List
 */

export const getTodosListRequestSchema = createRequestSchema({});
