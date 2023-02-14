import { APIGatewayProxyResult } from "aws-lambda";

// NOTE: Modify these to be more secure before implementing in any production codebase
const headers = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};

export function statusOk<T>(response: T): APIGatewayProxyResult {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers,
  };
}
