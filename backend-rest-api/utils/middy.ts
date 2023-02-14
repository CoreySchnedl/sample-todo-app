import { injectLambdaContext, Logger } from "@aws-lambda-powertools/logger";
import { captureLambdaHandler, Tracer } from "@aws-lambda-powertools/tracer";
import middy, { MiddyfiedHandler } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpRouterHandler, { Route } from "@middy/http-router";
import { Context } from "aws-lambda";

const logger = new Logger();
const tracer = new Tracer();

export const withHttpMiddleware = <TEvent>(
  routes: Route<TEvent>[]
): MiddyfiedHandler<any, any, Error, Context> => {
  const wrapper = middy()
    .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger))
    .use(httpEventNormalizer())
    .use(httpJsonBodyParser())
    .use(httpErrorHandler())
    .handler(httpRouterHandler(routes));

  return wrapper;
};
