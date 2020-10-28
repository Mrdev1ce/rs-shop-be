import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../services/product.service";
import { GatewayInternalErrorResult } from "../common/lambda-results";

const productService = new ProductService();

export const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const productsList = productService.getProductList();
    return {
      statusCode: 200,
      body: JSON.stringify(productsList, null, 2),
    };
  } catch (e) {
    return new GatewayInternalErrorResult();
  }
};
