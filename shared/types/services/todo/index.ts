import {
  CreateTodoEventRequestBody,
  CreateTodoEventResponseBody,
  GetTodoEventResponseBody,
} from "../../../../backend-rest-api/lambdas/todo/types";

export namespace TodosAPIServiceContracts {
  export type CreateTodoRequest = CreateTodoEventRequestBody;
  export type CreateTodoResponse = CreateTodoEventResponseBody;

  export type GetTodoResponse = GetTodoEventResponseBody;
}
