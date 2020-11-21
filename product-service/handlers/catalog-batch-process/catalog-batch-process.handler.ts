import { SQSHandler } from "aws-lambda";
import "source-map-support/register";
import { Logger } from "../../../core/logger";
import { ProductService } from "../../services/product/product.service";
import { Product } from "../../../core/types";

const logger = new Logger("CatalogBatchProcessHandler");

export const catalogBatchProcess: SQSHandler = async (event) => {
  const { Records } = event;
  const productService = new ProductService();

  logger.info("Input records", Records);

  try {
    const productRecords = Records.map((record) => {
      return JSON.parse(record.body) as Product;
    });
    await productService.createProducts(productRecords);
  } catch (e) {
    logger.error("Error in processing queue", e);
  }
};
