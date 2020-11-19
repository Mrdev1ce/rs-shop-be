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
  plugins: ["serverless-webpack", "serverless-dotenv-plugin"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      PG_HOST: "${env:PG_HOST}",
      PG_PORT: "${env:PG_PORT}",
      PG_DATABASE: "${env:PG_DATABASE}",
      PG_USERNAME: "${env:PG_USERNAME}",
      PG_PASSWORD: "${env:PG_PASSWORD}",
      PRODUCTS_QUEUE_URL: {
        Ref: "CatalogItemsQueue",
      },
    },
    region: "eu-west-1",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: {
          "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
        },
      },
    ],
  },
  resources: {
    Resources: {
      CatalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "products-sqs-queue",
        },
      },
    },
    Outputs: {
      CatalogItemsQueue: {
        Value: {
          Ref: "CatalogItemsQueue",
        },
        Export: {
          Name: "CatalogItemsQueue",
        },
      },
      CatalogItemsQueueUrl: {
        Value: {
          Ref: "CatalogItemsQueue",
        },
        Export: {
          Name: "CatalogItemsQueueUrl",
        },
      },
      CatalogItemsQueueArn: {
        Value: {
          "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
        },
        Export: {
          Name: "CatalogItemsQueueArn",
        },
      },
    },
  },
  functions: {
    getProductsList: {
      handler: "handler.getProductsList",
      events: [
        {
          http: {
            method: "get",
            path: "products",
            cors: true,
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
            cors: true,
          },
        },
      ],
    },
    createProduct: {
      handler: "handler.createProduct",
      events: [
        {
          http: {
            method: "post",
            path: "products",
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: "handler.catalogBatchProcess",
      events: [
        {
          sqs: {
            arn: {
              "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
            },
            batchSize: 5,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
