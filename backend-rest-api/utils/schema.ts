import { JSONSchema } from "json-schema-to-ts";

interface CreateRequestSchemaOptions<
  TBody extends JSONSchema,
  TPathParams extends JSONSchema,
  TQueryStringParams extends JSONSchema
> {
  body?: TBody;
  pathParameters?: TPathParams;
  queryStringParameters?: TQueryStringParams;
}

/**
 * Creates the full request schema by combining the body, pathParameters,
 * and queryStringParameters schemas.
 *
 * The result of this function is used as the validator for the request as a
 * whole.
 */
export const createRequestSchema = <
  TBody extends JSONSchema,
  TPathParams extends JSONSchema,
  TQueryStringParams extends JSONSchema
>({
  body,
  pathParameters,
  queryStringParameters,
}: CreateRequestSchemaOptions<TBody, TPathParams, TQueryStringParams>) => {
  return {
    type: "object",
    properties: {
      ...(body && { body }),
      ...(pathParameters && { pathParameters }),
      ...(queryStringParameters && { queryStringParameters }),
    },
  };
};
