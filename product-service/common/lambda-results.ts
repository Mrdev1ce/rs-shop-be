import { APIGatewayProxyResult } from "aws-lambda";

export class GatewayNotFoundResult implements APIGatewayProxyResult {
  public statusCode = 404;
  public body = null;
}

export class GatewayInternalErrorResult implements APIGatewayProxyResult {
  public statusCode = 500;
  public body = null;
}
