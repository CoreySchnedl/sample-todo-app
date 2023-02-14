import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import { DDBTodo } from "../../models/DDBModels";
import * as schemas from "./schemas";

export type TodoEventHandlerEventOutput = APIGatewayProxyResult;
export type TodoEventHandlerEventInput = Omit<
  APIGatewayProxyEvent,
  "body" | "pathParameters" | "queryStringParameters"
> & {
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: {} | CreateTodoEventRequestBody;
};

export type CreateTodoEventRequestBody = FromSchema<
  typeof schemas.createTodoRequestBodySchema
>;
export type CreateTodoEventResponseBody = DDBTodo;

export type GetTodoEventRequestPathParameters = FromSchema<
  typeof schemas.getTodoRequestPathParameters
>;
export type GetTodoEventResponseBody = DDBTodo;

export type GetTodoByIdInput = {
  id: string;
};
export type GetTodoByIdOutput = DDBTodo;

export type CreateTodoInput = Omit<DDBTodo, "id">;
export type CreateTodoOutput = DDBTodo;

export interface ITodoService {
  getTodoById(input: GetTodoByIdInput): Promise<GetTodoByIdOutput>;
  createTodo(input: CreateTodoInput): Promise<CreateTodoOutput>;
}
