import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
import "source-map-support/register";

import { Logger } from "../core/logger";
import { creds } from "./config/creds";

const effect = {
  ALLOW: "Allow",
  DENY: "Deny",
} as const;
type Effect = typeof effect[keyof typeof effect];

const generatePolicy = (principal: string, effect: Effect, arn: string) => ({
  principalId: principal,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: arn,
      },
    ],
  },
});

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (
  event
) => {
  const logger = new Logger("BasicAuthorizer");
  logger.info("INPUT: ", event);

  if (event.type !== "TOKEN") {
    throw new Error("Unauthorized");
  }
  try {
    const token = event.authorizationToken;
    const encodedCreds = token.split(" ")[1];
    const decodedCreds = Buffer.from(encodedCreds, "base64").toString("utf-8");
    logger.info("DECODED CREDS: ", decodedCreds);

    const [user, pass] = decodedCreds.split(":");

    const resultEffect =
      user === creds.USER && pass === creds.PASS ? effect.ALLOW : effect.DENY;

    return generatePolicy(encodedCreds, resultEffect, event.methodArn);
  } catch {
    throw new Error("Unauthorized");
  }
};
