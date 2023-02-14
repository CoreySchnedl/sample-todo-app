import middy from "@middy/core";
import { Method, Route } from "@middy/http-router";
import validator from "@middy/validator";
import { TodosAPIServiceContracts } from "@shared/services";
import { withHttpMiddleware } from "../../utils/middy";
import { statusOk } from "../../utils/response";
import { NormalizedEventHandler } from "../../utils/types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import * as schemas from "./schemas";
import {
  GetTodoEventRequestPathParameters,
  TodoEventHandlerEventInput,
} from "./types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TodoService } from "./todo.service";

const documentClient = DynamoDBDocument.from(new DynamoDBClient({}), {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  },
});

const todoService = new TodoService({
  documentClient,
});

/**
 * Handlers
 */

const postTodoHandler: NormalizedEventHandler<
  TodosAPIServiceContracts.CreateTodoRequest
> = async (event) => {
  const { name, description, priority } = event.body;

  const result = await todoService.createTodo({
    name,
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
          eventSchema: schemas.createTodoRequestSchema,
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
          eventSchema: schemas.createTodoRequestSchema,
        })
      )
      .handler(getTodoHandler),
  },
];

export const handler = withHttpMiddleware<TodoEventHandlerEventInput>(routes);
