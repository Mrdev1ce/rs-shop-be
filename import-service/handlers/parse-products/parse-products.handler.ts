import { S3Handler } from "aws-lambda";
import "source-map-support/register";
import { S3 } from "aws-sdk";
import * as csv from "csv-parser";
import { DEFAULT_REGION } from "../../../core/env.config";
import {
  IMPORT_SERVICE_BUCKET,
  PARSED_DIRECTORY,
  UPLOAD_DIRECTORY,
} from "../../common/config";
import { Logger } from "../../../core/logger";

const s3 = new S3({ region: DEFAULT_REGION });
const logger = new Logger("ParseProductsHandler");

export const parseProducts: S3Handler = (event, _context) => {
  try {
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
        .on("data", (data) => {
          logger.info("Parsed chunk", data);
        })
        .on("end", async () => {
          logger.info(
            `Copy from ${IMPORT_SERVICE_BUCKET}/${record.s3.object.key}`
          );

          const copyTo = record.s3.object.key.replace(
            UPLOAD_DIRECTORY,
            PARSED_DIRECTORY
          );

          logger.info(`Coping to ${copyTo}`);
          await s3
            .copyObject({
              Bucket: IMPORT_SERVICE_BUCKET,
              CopySource: record.s3.object.key,
              Key: copyTo,
            })
            .promise();

          logger.info(`Copied to ${IMPORT_SERVICE_BUCKET}/${copyTo}`);
        });
    });
  } catch (e) {
    console.error(e);
  }
};
