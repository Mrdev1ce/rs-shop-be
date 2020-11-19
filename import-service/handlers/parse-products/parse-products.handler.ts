import { S3Handler } from "aws-lambda";
import "source-map-support/register";
import { S3, SQS } from "aws-sdk";
import * as csv from "csv-parser";
import { DEFAULT_REGION } from "../../../core/env.config";
import {
  CATALOG_ITEMS_QUEUE_URL,
  IMPORT_SERVICE_BUCKET,
  PARSED_DIRECTORY,
  UPLOAD_DIRECTORY,
} from "../../common/config";
import { Logger } from "../../../core/logger";

const logger = new Logger("ParseProductsHandler");

export const parseProducts: S3Handler = (event, _context) => {
  try {
    const s3 = new S3({ region: DEFAULT_REGION });
    const sqs = new SQS();

    logger.info("Input records", event.Records);
    event.Records.forEach((record) => {
      const s3Stream = s3
        .getObject({
          Bucket: IMPORT_SERVICE_BUCKET,
          Key: record.s3.object.key,
        })
        .createReadStream();

      s3Stream
        .pipe(csv())
        .on("data", async (data) => {
          logger.info("Parsed chunk", data);
          await sqs
            .sendMessage({
              QueueUrl: CATALOG_ITEMS_QUEUE_URL,
              MessageBody: JSON.stringify(data),
            })
            .promise();
        })
        .on("end", async () => {
          const copyFrom = `${IMPORT_SERVICE_BUCKET}/${record.s3.object.key}`;
          const copyTo = record.s3.object.key.replace(
            UPLOAD_DIRECTORY,
            PARSED_DIRECTORY
          );

          logger.info(`Copy from ${copyFrom}`);

          await s3
            .copyObject({
              CopySource: copyFrom,
              Bucket: IMPORT_SERVICE_BUCKET,
              Key: copyTo,
            })
            .promise();

          logger.info(`Copied to ${IMPORT_SERVICE_BUCKET}/${copyTo}`);

          await s3
            .deleteObject({
              Bucket: IMPORT_SERVICE_BUCKET,
              Key: record.s3.object.key,
            })
            .promise();
          logger.info(
            `Removed ${IMPORT_SERVICE_BUCKET}/${record.s3.object.key}`
          );
        });
    });
  } catch (e) {
    console.error(e);
  }
};
