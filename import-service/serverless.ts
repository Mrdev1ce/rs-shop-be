import type { Serverless } from "serverless/aws";
import { DEFAULT_REGION } from "../core/env.config";

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
  plugins: ["serverless-webpack"],
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
          },
        },
      ],
    },
  },
  // resources: {
  //   Resources: {
  //     ImportS3Bucket: {
  //       Type: "AWS::S3::Bucket",
  //       Properties: {
  //         BucketName: "ImportServiceBucket",
  //         AccessControl: "PublicRead",
  //       },
  //     },
  //     WebAppS3BucketPolicy: {
  //       Type: "AWS::S3::BucketPolicy",
  //       Properties: {
  //         Bucket: {
  //           Ref: "WebAppS3Bucket",
  //         },
  //         PolicyDocument: {
  //           Statement: [
  //             {
  //               Sid: "AllowCloudFrontAccessIdentity",
  //               Effect: "Allow",
  //               Action: "s3:GetObject",
  //               Resource: "arn:aws:s3:::/*",
  //               Principal: {
  //                 AWS: {
  //                   "Fn::Join": [
  //                     " ",
  //                     [
  //                       "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity",
  //                       123,
  //                     ],
  //                   ],
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   },
  // },
};

module.exports = serverlessConfiguration;
