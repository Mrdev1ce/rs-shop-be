import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../services/product.service";
import {
  GatewayInternalErrorResult,
  GatewayNotFoundResult,
} from "../common/lambda-results";

const productService = new ProductService();

export const getProductById: APIGatewayProxyHandler = async (event) => {
  const {
    pathParameters: { productId },
  } = event;

  try {
    const product = productService.getProductById(productId);
    if (product == null) {
      return new GatewayNotFoundResult();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product, null, 2),
    };
  } catch (e) {
    return new GatewayInternalErrorResult();
  }
};
