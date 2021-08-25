import { SQSHandler } from "aws-lambda";
import "source-map-support/register";
import { Logger } from "../../common/logger";
import { ProductService } from "../../services/product/product.service";
import { ProductSnsNotificationService } from "../../services/product-sns-notification/product-sns-notification.service";
import { Product } from "../../../core/types";


const logger = new Logger("CatalogBatchProcessHandler");

export const catalogBatchProcess: SQSHandler = async (event) => {
  const { Records } = event;
  const productService = new ProductService();
  const productSnsNotificationService = new ProductSnsNotificationService();

  logger.info("Input records", Records);

  try {
    const productRecords = Records.map((record) => {
      return JSON.parse(record.body) as Product;
    });
    const products = await productService.createProducts(productRecords);

    await productSnsNotificationService.notify(products);
  } catch (e) {
    logger.error("Error in processing queue", e);
  }
};
