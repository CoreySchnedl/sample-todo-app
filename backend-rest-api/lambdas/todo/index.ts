import middy from "@middy/core";
import { Method, Route } from "@middy/http-router";
import validator from "@middy/validator";
import { TodosAPIServiceContracts } from "@shared/types";
import { withHttpMiddleware } from "../../utils/middy";
import { statusOk } from "../../utils/response";
import { NormalizedEventHandler } from "../../utils/types";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { transpileSchema } from "@middy/validator/transpile";
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
];

export const handler = withHttpMiddleware<TodoEventHandlerEventInput>(routes);

const event = {
  resource: "/v1/todos",
  path: "/v1/todos",
  httpMethod: "POST",
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9",
    Authorization:
      "Bearer eyJraWQiOiIybGhuUFI2K1BvWnhEN29KbkpIb0NPODc2V1lSRWFsTkpKSHJNVUtsbW5jPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNjI0YWM5Ni05YjFlLTQ4OGQtYmQ2Yy0yMTg3OTY1ZjVlMzUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9DTmZZdTAyUTEiLCJjb2duaXRvOnVzZXJuYW1lIjoiY3NjaG5lZGxAYW1hem9uLmNvbSIsIm9yaWdpbl9qdGkiOiIxODU2ZmVmMS04NWQwLTRjYjgtOGExOC1jNTlkYWMwYzg2ZjkiLCJhdWQiOiI1MDFuZmo5YnBlMHU4NDUxMWZ2aW01czBmMSIsImV2ZW50X2lkIjoiYmI0NDQyYTQtNjczNS00YThiLTgzMTctYzY1M2U2MjdhMWQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NzY0NzkyNTMsImV4cCI6MTY3NjUwNTUzMiwiaWF0IjoxNjc2NTAxOTMyLCJqdGkiOiIzNTE5Yzk4ZC1lNmM4LTRiNjgtYmMxNi1lOGZmNGViYjg3YmEiLCJlbWFpbCI6ImNzY2huZWRsQGFtYXpvbi5jb20ifQ.W58cwJvjQWJLfulEGR2VoZpS2F3lQ-8QaQOE3fNtXYWTT8R73hAJ65-JlGr3OzDs0HOhHjTdVPUr2wbVSGn7uV4P1_AYeOvSozERGex5CuWxDYgPM9bncGZgcii4vo0BJwjUSQzKwGuP6XsGBhOiBYDOM1x8-H1PK2wwUbRAcCclX2OIJyS4QMjBUOuVoY7lzhvmaitCLrKTHYExMeYs46NU1mJax_ABY3TGiQRxjAK6M_qbbJ00V1y1NgzklbADv4UX1lbI7IylwFamUFZzRTOSNVPe6sZPXuuz-sc3__9qWOEGDjAqSbmpJYLrtchRupXXe_M3_n7fmqKR4DDoPg",
    "content-type": "application/json",
    Host: "io1ci1hgzk.execute-api.us-east-1.amazonaws.com",
    origin: "http://localhost:3000",
    referer: "http://localhost:3000/",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "X-Amzn-Trace-Id": "Root=1-63ed6e1b-19c9c0cc20f687cd122eac61",
    "X-Forwarded-For": "74.128.224.235",
    "X-Forwarded-Port": "443",
    "X-Forwarded-Proto": "https",
  },
  multiValueHeaders: {
    accept: ["application/json, text/plain, */*"],
    "accept-encoding": ["gzip, deflate, br"],
    "accept-language": ["en-US,en;q=0.9"],
    Authorization: [
      "Bearer eyJraWQiOiIybGhuUFI2K1BvWnhEN29KbkpIb0NPODc2V1lSRWFsTkpKSHJNVUtsbW5jPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNjI0YWM5Ni05YjFlLTQ4OGQtYmQ2Yy0yMTg3OTY1ZjVlMzUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9DTmZZdTAyUTEiLCJjb2duaXRvOnVzZXJuYW1lIjoiY3NjaG5lZGxAYW1hem9uLmNvbSIsIm9yaWdpbl9qdGkiOiIxODU2ZmVmMS04NWQwLTRjYjgtOGExOC1jNTlkYWMwYzg2ZjkiLCJhdWQiOiI1MDFuZmo5YnBlMHU4NDUxMWZ2aW01czBmMSIsImV2ZW50X2lkIjoiYmI0NDQyYTQtNjczNS00YThiLTgzMTctYzY1M2U2MjdhMWQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NzY0NzkyNTMsImV4cCI6MTY3NjUwNTUzMiwiaWF0IjoxNjc2NTAxOTMyLCJqdGkiOiIzNTE5Yzk4ZC1lNmM4LTRiNjgtYmMxNi1lOGZmNGViYjg3YmEiLCJlbWFpbCI6ImNzY2huZWRsQGFtYXpvbi5jb20ifQ.W58cwJvjQWJLfulEGR2VoZpS2F3lQ-8QaQOE3fNtXYWTT8R73hAJ65-JlGr3OzDs0HOhHjTdVPUr2wbVSGn7uV4P1_AYeOvSozERGex5CuWxDYgPM9bncGZgcii4vo0BJwjUSQzKwGuP6XsGBhOiBYDOM1x8-H1PK2wwUbRAcCclX2OIJyS4QMjBUOuVoY7lzhvmaitCLrKTHYExMeYs46NU1mJax_ABY3TGiQRxjAK6M_qbbJ00V1y1NgzklbADv4UX1lbI7IylwFamUFZzRTOSNVPe6sZPXuuz-sc3__9qWOEGDjAqSbmpJYLrtchRupXXe_M3_n7fmqKR4DDoPg",
    ],
    "content-type": ["application/json"],
    Host: ["io1ci1hgzk.execute-api.us-east-1.amazonaws.com"],
    origin: ["http://localhost:3000"],
    referer: ["http://localhost:3000/"],
    "sec-ch-ua": [
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    ],
    "sec-ch-ua-mobile": ["?0"],
    "sec-ch-ua-platform": ['"macOS"'],
    "sec-fetch-dest": ["empty"],
    "sec-fetch-mode": ["cors"],
    "sec-fetch-site": ["cross-site"],
    "User-Agent": [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    ],
    "X-Amzn-Trace-Id": ["Root=1-63ed6e1b-19c9c0cc20f687cd122eac61"],
    "X-Forwarded-For": ["74.128.224.235"],
    "X-Forwarded-Port": ["443"],
    "X-Forwarded-Proto": ["https"],
  },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {
    resourceId: "wojv2r",
    authorizer: {
      claims: {
        origin_jti: "1856fef1-85d0-4cb8-8a18-c59dac0c86f9",
        sub: "e624ac96-9b1e-488d-bd6c-2187965f5e35",
        aud: "501nfj9bpe0u84511fvim5s0f1",
        event_id: "bb4442a4-6735-4a8b-8317-c653e627a1d7",
        token_use: "id",
        auth_time: "1676479253",
        iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_CNfYu02Q1",
        "cognito:username": "cschnedl@amazon.com",
        exp: "Wed Feb 15 23:58:52 UTC 2023",
        iat: "Wed Feb 15 22:58:52 UTC 2023",
        jti: "3519c98d-e6c8-4b68-bc16-e8ff4ebb87ba",
        email: "cschnedl@amazon.com",
      },
    },
    resourcePath: "/v1/todos",
    httpMethod: "POST",
    extendedRequestId: "AZ4kTH9hIAMFyww=",
    requestTime: "15/Feb/2023:23:43:23 +0000",
    path: "/dev/v1/todos",
    accountId: "980386132378",
    protocol: "HTTP/1.1",
    stage: "dev",
    domainPrefix: "io1ci1hgzk",
    requestTimeEpoch: 1676504603272,
    requestId: "60de730f-8498-4c5b-a920-e015b7667951",
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      sourceIp: "74.128.224.235",
      principalOrgId: null,
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      user: null,
    },
    domainName: "io1ci1hgzk.execute-api.us-east-1.amazonaws.com",
    apiId: "io1ci1hgzk",
  },
  body: '{"name":"test","description":"test desc","priority":"LOW"}',
  isBase64Encoded: false,
};

handler(event, {} as any);
