declare module "@middy/http-router" {
  type TResult = APIGatewayProxyResult;

  export enum Method {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE",
    Options = "OPTIONS",
    Head = "HEAD",
    Any = "ANY",
  }

  export interface Route<TEvent> {
    method: string;
    path: string;
    handler: NormalizedEventHandler<TEvent>;
  }

  function httpRouterHandler<TEvent>(
    routes: Array<Route<TEvent>>
  ): middy.MiddyfiedHandler;

  export default httpRouterHandler;
}
