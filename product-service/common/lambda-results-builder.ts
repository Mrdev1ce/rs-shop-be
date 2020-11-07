import { APIGatewayProxyResult } from "aws-lambda";

const buildCorsHeaders = () => {
  return {
    "Access-Control-Allow-Origin": "*",
  };
};

export const buildBody = (body: unknown): string => {
  return body ? JSON.stringify(body, null, 2) : null;
};

type BuildGatewayResultParams = Partial<
  Omit<APIGatewayProxyResult, "body"> & { body: unknown }
>;
export const buildGatewayResult = ({
  statusCode,
  body,
  headers,
  ...rest
}: BuildGatewayResultParams): APIGatewayProxyResult => {
  const corsHeaders = buildCorsHeaders();
  return {
    ...rest,
    headers: { ...headers, ...corsHeaders },
    statusCode: statusCode || 200,
    body: buildBody(body),
  };
};

export const buildCreatedGatewayResult = (body: unknown) => {
  return buildGatewayResult({
    statusCode: 201,
    body,
  });
};

export const buildGatewayNotFoundResult = (message?: string) => {
  const response = {
    body: message ? { message } : null,
    statusCode: 404,
  };
  return buildGatewayResult(response);
};

export const buildGatewayBadRequestResult = (
  message?: string,
  data?: Record<string, unknown>
) => {
  const response = {
    body: { message, ...data },
    statusCode: 400,
  };
  return buildGatewayResult(response);
};

export const buildGatewayInternalErrorResult = () => {
  const response = {
    statusCode: 500,
  };
  return buildGatewayResult(response);
};
