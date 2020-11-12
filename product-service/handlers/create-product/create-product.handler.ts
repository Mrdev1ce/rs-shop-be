import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../../services/product/product.service";
import { Product } from "../../services/product/types";
import {
  buildCreatedGatewayResult,
  buildGatewayInternalErrorResult,
  buildGatewayBadRequestResult,
} from "../../common/lambda-results-builder";
import { Logger } from "../../../core/logger";
import { validateProductOnCreate } from "./product.validators";

const logger = new Logger("CreateProductHandler");

export const createProduct: APIGatewayProxyHandler = async (event) => {
  const { body } = event;
  const productService = new ProductService();

  logger.info("Input", event);

  try {
    const product = JSON.parse(body) as Product;
    const validationResult = validateProductOnCreate(product);

    if (validationResult.error != null) {
      const message = "Incorrect request";
      const data = { error: validationResult.error };
      return buildGatewayBadRequestResult(message, data);
    }

    const createdProduct = await productService.createProduct(product);

    return buildCreatedGatewayResult({
      body: createdProduct,
    });
  } catch (e) {
    logger.error("Internal server error", e);
    return buildGatewayInternalErrorResult();
  }
};
