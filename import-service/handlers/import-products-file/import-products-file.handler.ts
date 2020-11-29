import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { S3 } from "aws-sdk";
import {
  buildGatewayInternalErrorResult,
  buildGatewayResult,
} from "../../common/lambda-results-builder";
import { DEFAULT_REGION } from "../../../core/env.config";
import { UPLOAD_DIRECTORY, IMPORT_SERVICE_BUCKET } from "../../common/config";
import { Logger } from "../../../core/logger";

const logger = new Logger("ImportProductsFileHandler");

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
  const s3 = new S3({ region: DEFAULT_REGION });

  try {
    const { name: fileName } = event.queryStringParameters;
    const params = {
      Bucket: IMPORT_SERVICE_BUCKET,
      Key: `${UPLOAD_DIRECTORY}/${fileName}`,
      Expires: 60,
      ContentType: "text/csv",
    };

    const url = await s3.getSignedUrlPromise("putObject", params);

    return buildGatewayResult({
      body: { url },
    });
  } catch (e) {
    logger.error("Internal Server Error", e);
    return buildGatewayInternalErrorResult();
  }
};
