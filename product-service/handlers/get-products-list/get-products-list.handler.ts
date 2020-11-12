import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../../services/product/product.service";
import {
  buildGatewayResult,
  buildGatewayInternalErrorResult,
} from "../../common/lambda-results-builder";
import { Logger } from "../../../core/logger";

const logger = new Logger("GetProductsListHandler");

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  const productService = new ProductService();

  logger.info("Input", event);

  try {
    const productsList = await productService.getProductList();
    return buildGatewayResult({
      body: productsList,
    });
  } catch (e) {
    logger.error("Internal server error", e);
    return buildGatewayInternalErrorResult();
  }
};
