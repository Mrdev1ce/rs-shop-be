import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductService } from "../services/product.service";
import {
  buildGatewayResult,
  buildGatewayInternalErrorResult,
} from "../common/lambda-results-builder";

export const getProductsList: APIGatewayProxyHandler = async () => {
  const productService = new ProductService();

  try {
    const productsList = await productService.getProductList();
    return buildGatewayResult({
      body: productsList,
    });
  } catch (e) {
    return buildGatewayInternalErrorResult();
  }
};
