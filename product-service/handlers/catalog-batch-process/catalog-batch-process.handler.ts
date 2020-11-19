import { SQSHandler } from "aws-lambda";
import "source-map-support/register";
import { Logger } from "../../../core/logger";

const logger = new Logger("CatalogBatchProcessHandler");

export const catalogBatchProcess: SQSHandler = (event) => {
  const { Records } = event;

  logger.info("Input records", Records);

  try {
    Records.forEach((record) => {
      logger.info("Got message", record.body);
    });
  } catch (e) {
    logger.error("Error in processing queue", e);
  }
};
