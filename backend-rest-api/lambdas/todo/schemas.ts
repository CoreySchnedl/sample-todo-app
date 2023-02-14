import { TodoPriority } from "../../../shared";
import { createRequestSchema } from "../../utils/schema";

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
