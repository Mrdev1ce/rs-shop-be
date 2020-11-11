import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { S3 } from "aws-sdk";
import {
  buildGatewayInternalErrorResult,
  buildGatewayResult,
} from "../../common/lambda-results-builder";
import { DEFAULT_REGION } from "../../../core/env.config";

const s3 = new S3({ region: DEFAULT_REGION });
const BUCKET = "import-service-bucket";

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    const { name: fileName } = event.queryStringParameters;
    const params = {
      Bucket: BUCKET,
      Key: `uploaded/${fileName}`,
      Expires: 60,
      ContentType: "text/csv",
    };

    const url = await s3.getSignedUrlPromise("putObject", params);

    return buildGatewayResult({
      body: { url },
    });
  } catch (e) {
    console.error(e);
    return buildGatewayInternalErrorResult();
  }
};
