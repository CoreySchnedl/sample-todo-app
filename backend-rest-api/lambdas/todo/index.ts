import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import { Method, Route } from "@middy/http-router";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { TodosAPIServiceContracts } from "@shared/types";
import { withHttpMiddleware } from "../../utils/middy";
import { statusOk, statusOkNoContent } from "../../utils/response";
import { NormalizedEventHandler } from "../../utils/types";
import * as schemas from "./schemas";
import { TodoService } from "./todo.service";
import {
  DeleteTodoEventRequestPathParameters,
  GetTodoEventRequestPathParameters,
  ITodoService,
  TodoEventHandlerEventInput,
  UpdateTodoEventRequestPathParameters,
} from "./types";

const documentClient = DynamoDBDocument.from(new DynamoDBClient({}), {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  },
});

const todoService: ITodoService = new TodoService({
  documentClient,
});

/**
 * Handlers
 */

const postTodoHandler: NormalizedEventHandler<
  TodosAPIServiceContracts.CreateTodoRequest
> = async (event) => {
  const { name, description, priority } = event.body;
  const { sub } = event.requestContext.authorizer?.claims || "";

  const result = await todoService.createTodo({
    name,
    sub,
    description,
    priority,
  });

  return statusOk<TodosAPIServiceContracts.CreateTodoResponse>(result);
};

const getTodoHandler: NormalizedEventHandler<
  void,
  GetTodoEventRequestPathParameters
> = async (event) => {
  const { id } = event.pathParameters;

  const result = await todoService.getTodoById({ id });

  return statusOk<TodosAPIServiceContracts.GetTodoResponse>(result);
};

const updateTodoHandler: NormalizedEventHandler<
  TodosAPIServiceContracts.UpdateTodoRequest,
  UpdateTodoEventRequestPathParameters
> = async (event) => {
  const { id } = event.pathParameters;
  const { sub } = event.requestContext.authorizer?.claims || "";
  const { name, description, priority } = event.body;

  const result = await todoService.updateTodo({
    id,
    sub,
    name,
    description,
    priority,
  });

  return statusOk<TodosAPIServiceContracts.UpdateTodoResponse>(result);
};

const deleteTodoHandler: NormalizedEventHandler<
  void,
  DeleteTodoEventRequestPathParameters
> = async (event) => {
  const { id } = event.pathParameters;

  await todoService.deleteTodo({ id });

  return statusOkNoContent();
};

const getTodosListHandler: NormalizedEventHandler<void> = async (event) => {
  const { sub } = event.requestContext.authorizer?.claims || "";

  const result = await todoService.getTodosBySub({ sub });

  return statusOk<TodosAPIServiceContracts.GetTodosListResponse>(result);
};

/**
 * Routes
 */

const routes: Route<TodoEventHandlerEventInput>[] = [
  {
    method: Method.Post,
    path: "/v1/todos",
    handler: middy()
      .use(
        validator({
          eventSchema: transpileSchema(schemas.createTodoRequestSchema),
        })
      )
      .handler(postTodoHandler),
  },
  {
    method: Method.Get,
    path: "/v1/todos/{id}",
    handler: middy()
      .use(
        validator({
          eventSchema: transpileSchema(schemas.createTodoRequestSchema),
        })
      )
      .handler(getTodoHandler),
  },
  {
    method: Method.Put,
    path: "/v1/todos/{id}",
    handler: middy()
      .use(
        validator({
          eventSchema: transpileSchema(schemas.updateTodoRequestSchema),
        })
      )
      .handler(updateTodoHandler),
  },
  {
    method: Method.Delete,
    path: "/v1/todos/{id}",
    handler: middy()
      .use(
        validator({
          eventSchema: transpileSchema(schemas.deleteTodoRequestSchema),
        })
      )
      .handler(deleteTodoHandler),
  },
  {
    method: Method.Get,
    path: "/v1/todos",
    handler: middy()
      .use(
        validator({
          eventSchema: transpileSchema(schemas.getTodosListRequestSchema),
        })
      )
      .handler(getTodosListHandler),
  },
];

export const handler = withHttpMiddleware<TodoEventHandlerEventInput>(routes);
