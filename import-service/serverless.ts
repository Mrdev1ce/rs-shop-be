import type { Serverless } from "serverless/aws";
import { DEFAULT_REGION } from "../core/env.config";
import { IMPORT_SERVICE_BUCKET, UPLOAD_DIRECTORY } from "./common/config";

// resources:
//   Resources:
//     ## Specifying the S3 Bucket
// WebAppS3Bucket:
//   Type: AWS::S3::Bucket
// Properties:
//   BucketName: ${self:custom.s3BucketName}
//     AccessControl: PublicRead
// WebsiteConfiguration:
//   IndexDocument: index.html
// ErrorDocument: index.html
// # VersioningConfiguration:
// #   Status: Enabled
//
// ## Specifying the policies to make sure all files inside the Bucket are avaialble to CloudFront
// WebAppS3BucketPolicy:
//   Type: AWS::S3::BucketPolicy
// Properties:
//   Bucket:
//     Ref: WebAppS3Bucket
// PolicyDocument:
//   Statement:
//     - Sid: 'AllowCloudFrontAccessIdentity'
// Effect: Allow
// Action: s3:GetObject
// Resource: arn:aws:s3:::${self:custom.s3BucketName}/*
//               Principal:
//                 AWS:
//                   Fn::Join:
//                     - ' '
//                     - - 'arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity'
//                       - !Ref OriginAccessIdentity

const serverlessConfiguration: Serverless = {
  service: {
    name: "import-service",
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
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack", "serverless-pseudo-parameters"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    region: DEFAULT_REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      CATALOG_ITEMS_QUEUE_URL: {
        "Fn::ImportValue": "CatalogItemsQueueUrl",
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: "arn:aws:s3:::import-service-bucket",
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "arn:aws:s3:::import-service-bucket/*",
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: {
          "Fn::ImportValue": "CatalogItemsQueueArn",
        },
      },
    ],
  },
  resources: {
    Resources: {
      GatewayResponseDefault400: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
        },
      },
    },
  },
  functions: {
    importProductsFile: {
      handler: "handler.importProductsFile",
      events: [
        {
          http: {
            method: "get",
            path: "import",
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
            cors: true,
            authorizer: {
              name: "tokenAuthorizer",
              arn:
                "arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:authorization-service-dev-basicAuthorizer",
              resultTtlInSeconds: 0,
              identitySource: "method.request.header.Authorization",
              type: "token",
            },
          },
        },
      ],
    },
    parseProducts: {
      handler: "handler.parseProducts",
      events: [
        {
          s3: {
            bucket: IMPORT_SERVICE_BUCKET,
            event: "s3:ObjectCreated:*",
            rules: [
              {
                prefix: `${UPLOAD_DIRECTORY}/`,
                suffix: "",
              },
            ],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
