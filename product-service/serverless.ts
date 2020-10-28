import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "product-service",
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    region: "eu-west-1",
  },
  functions: {
    getProductsList: {
      handler: "handler.getProductsList",
      events: [
        {
          http: {
            method: "get",
            path: "products",
          },
        },
      ],
    },
    getProductById: {
      handler: "handler.getProductById",
      events: [
        {
          http: {
            method: "get",
            path: "products/{productId}",
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
