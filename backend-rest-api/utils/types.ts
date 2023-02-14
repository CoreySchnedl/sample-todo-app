import { APIGatewayProxyEvent, Handler } from "aws-lambda";

export interface NormalizedEvent<TBody, TPathParameters, TQueryStringParameters>
  extends Omit<
    APIGatewayProxyEvent,
    "body" | "pathParameters" | "queryStringParameters"
  > {
  body: TBody;
  pathParameters: TPathParameters;
  queryStringParameters: TQueryStringParameters;
  multiValueQueryStringParameters: NonNullable<
    APIGatewayProxyEvent["multiValueQueryStringParameters"]
  >;
}

export type NormalizedEventHandler<
  TBody = void,
  TPathParameters = void,
  TQueryStringParameters = void
> = Handler<NormalizedEvent<TBody, TPathParameters, TQueryStringParameters>>;

export type NormlizedEventFromHandler<T extends (...args: any) => any> =
  Parameters<T>[0];
