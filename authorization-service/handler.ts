import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
import "source-map-support/register";

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
  console.log(event);

  if (event.type !== "TOKEN") {
    throw new Error("Unauthorized");
  }
  try {
    const token = event.authorizationToken;
    const encodedCreds = token.split(" ")[1];
    const [user, pass] = Buffer.from(encodedCreds, "base64")
      .toString("utf-8")
      .split(":");
    const resultEffect =
      user === "123" && pass === "213" ? effect.ALLOW : effect.DENY;

    return generatePolicy(encodedCreds, resultEffect, event.methodArn);
  } catch {
    throw new Error("Unauthorized");
  }
};
