import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../../services/product/product.service";
import {
  buildGatewayResult,
  buildGatewayInternalErrorResult,
  buildGatewayNotFoundResult,
} from "../../common/lambda-results-builder";
import { Logger } from "../../../core/logger";

const logger = new Logger("GetProductByIdHandler");

export const getProductById: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { productId },
  } = event;
  const productService = new ProductService();

  logger.info("Input", event);

  try {
    const product = await productService.getProductById(productId);
    if (product == null) {
      const message = "Product was not found";
      return buildGatewayNotFoundResult(message);
    }

    return buildGatewayResult({
      body: product,
    });
  } catch (e) {
    logger.error("Internal server error", e);
    return buildGatewayInternalErrorResult();
  }
};
