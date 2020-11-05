import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../services/product/product.service";
import {
  buildGatewayResult,
  buildGatewayInternalErrorResult,
  buildGatewayNotFoundResult,
} from "../common/lambda-results-builder";

export const getProductById: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { productId },
  } = event;
  const productService = new ProductService();

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
    console.error(e);
    return buildGatewayInternalErrorResult();
  }
};
