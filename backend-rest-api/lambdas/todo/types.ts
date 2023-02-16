import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import {
  DDBTodo,
  DDBTodoWithoutRecordType,
  DDBTodoWithoutRecordTypeOrSub,
} from "../../models/ddbmodels";
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

/**
 * Contract Types
 */

export type CreateTodoEventRequestBody = FromSchema<
  typeof schemas.createTodoRequestBodySchema
>;
export type CreateTodoEventResponseBody = DDBTodoWithoutRecordTypeOrSub;

export type GetTodoEventRequestPathParameters = FromSchema<
  typeof schemas.getTodoRequestPathParameters
>;
export type GetTodoEventResponseBody = DDBTodoWithoutRecordTypeOrSub;

export type UpdateTodoEventRequestBody = FromSchema<
  typeof schemas.updateTodoRequestBodySchema
>;
export type UpdateTodoEventRequestPathParameters = FromSchema<
  typeof schemas.updateTodoRequestPathParameters
>;
export type UpdateTodoEventResponseBody = DDBTodoWithoutRecordTypeOrSub;

export type DeleteTodoEventRequestPathParameters = FromSchema<
  typeof schemas.deleteTodoRequestPathParameters
>;

export type GetTodosListEventResponseBody =
  Array<DDBTodoWithoutRecordTypeOrSub>;
/**
 * TodoService Types
 */

export type GetTodoByIdInput = {
  id: string;
};
export type GetTodoByIdOutput = DDBTodoWithoutRecordTypeOrSub;

export type CreateTodoInput = Omit<DDBTodo, "id" | "recordType">;
export type CreateTodoOutput = DDBTodoWithoutRecordTypeOrSub;

export type UpdateTodoInput = DDBTodoWithoutRecordType;
export type UpdateTodoOutput = DDBTodoWithoutRecordTypeOrSub;

export type DeleteTodoInput = {
  id: string;
};

export type GetTodosBySubInput = {
  sub: string;
};

export type GetTodosBySubOutput = Array<DDBTodoWithoutRecordTypeOrSub>;

export interface ITodoService {
  getTodoById(input: GetTodoByIdInput): Promise<GetTodoByIdOutput>;
  createTodo(input: CreateTodoInput): Promise<CreateTodoOutput>;
  updateTodo(input: UpdateTodoInput): Promise<UpdateTodoOutput>;
  deleteTodo(input: DeleteTodoInput): Promise<boolean>;
  getTodosBySub(inpupt: GetTodosBySubInput): Promise<GetTodosBySubOutput>;
}
