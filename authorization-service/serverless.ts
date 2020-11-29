import type { Serverless } from "serverless/aws";
import { DEFAULT_REGION } from "../core/env.config";

const serverlessConfiguration: Serverless = {
  service: {
    name: "authorization-service",
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack", "serverless-dotenv-plugin"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    region: DEFAULT_REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
  },
  functions: {
    basicAuthorizer: {
      handler: "handler.basicAuthorizer",
    },
  },
};

module.exports = serverlessConfiguration;
