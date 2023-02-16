import {
  CreateTodoEventRequestBody,
  CreateTodoEventResponseBody,
  GetTodoEventResponseBody,
  GetTodosListEventResponseBody,
  UpdateTodoEventRequestBody,
  UpdateTodoEventResponseBody,
} from "../../../../backend-rest-api/lambdas/todo/types";

export namespace TodosAPIServiceContracts {
  export type CreateTodoRequest = CreateTodoEventRequestBody;
  export type CreateTodoResponse = CreateTodoEventResponseBody;

  export type GetTodoResponse = GetTodoEventResponseBody;

  export type UpdateTodoRequest = UpdateTodoEventRequestBody;
  export type UpdateTodoResponse = UpdateTodoEventResponseBody;

  export type GetTodosListResponse = GetTodosListEventResponseBody;
}
