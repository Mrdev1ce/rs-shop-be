import { getProductById } from "./get-product-by-id.handler";
import { APIGatewayProxyEvent } from "aws-lambda";
import { buildBody } from "../../common/lambda-results-builder";
import { ProductService } from "../../services/product/product.service";

jest.mock("../../services/product/product.service");

const MockProductService = ProductService as jest.MockedClass<
  typeof ProductService
>;

describe("getProductById handler", () => {
  beforeEach(() => {
    MockProductService.mockClear();
  });
  it("should return product by id", async () => {
    const productId = "7567ec4b-b10c-48c5-9345-fc73c48a80a2";
    const expectedProduct = {
      count: 7,
      description: "Short Product Description2",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
      price: 23,
      title: "ProductTop",
    };
    const event = ({
      pathParameters: { productId },
    } as unknown) as APIGatewayProxyEvent;
    const mockedGetProductById = jest
      .fn()
      .mockReturnValue(Promise.resolve(expectedProduct));
    MockProductService.mockImplementation(
      () =>
        (({
          getProductById: mockedGetProductById,
        } as unknown) as ProductService)
    );

    const result = await getProductById(event, null, null);

    expect(mockedGetProductById).toHaveBeenCalledTimes(1);
    expect(mockedGetProductById).toHaveBeenCalledWith(productId);
    expect(result).toMatchObject({
      statusCode: 200,
      body: buildBody(expectedProduct),
    });
  });

  it("should return 404 if there is no products was found", async () => {
    const productId = "123";
    const event = ({
      pathParameters: { productId },
    } as unknown) as APIGatewayProxyEvent;
    const mockedGetProductById = jest
      .fn()
      .mockReturnValue(Promise.resolve(null));
    MockProductService.mockImplementation(
      () =>
        (({
          getProductById: mockedGetProductById,
        } as unknown) as ProductService)
    );

    const result = await getProductById(event, null, null);

    expect(mockedGetProductById).toHaveBeenCalledTimes(1);
    expect(mockedGetProductById).toHaveBeenCalledWith(productId);
    expect(result).toMatchObject({
      statusCode: 404,
      body: buildBody({ message: "Product was not found" }),
    });
  });

  it("should return 500 if there is internal server error", async () => {
    const productId = "123";
    const event = ({
      pathParameters: { productId },
    } as unknown) as APIGatewayProxyEvent;
    const mockedGetProductById = jest.fn().mockReturnValue(Promise.reject());
    MockProductService.mockImplementation(
      () =>
        (({
          getProductById: mockedGetProductById,
        } as unknown) as ProductService)
    );

    const result = await getProductById(event, null, null);

    expect(mockedGetProductById).toHaveBeenCalledTimes(1);
    expect(mockedGetProductById).toHaveBeenCalledWith(productId);
    expect(result).toMatchObject({
      statusCode: 500,
      body: null,
    });
  });
});
