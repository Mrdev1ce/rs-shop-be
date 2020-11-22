import { getProductsList } from "./get-products-list.handler";
import { APIGatewayProxyEvent } from "aws-lambda";
import { buildBody } from "../../common/lambda-results-builder";
import { ProductService } from "../../services/product/product.service";

jest.mock("../../services/product/product.service");

const MockProductService = ProductService as jest.MockedClass<
  typeof ProductService
>;

describe("getProductList handler", () => {
  beforeEach(() => {});
  it("should return product list", async () => {
    const expectedProducts = [
      {
        count: 7,
        description: "Short Product Description2",
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
        price: 23,
        title: "ProductTop",
      },
    ];
    const event = ({} as unknown) as APIGatewayProxyEvent;
    const mockedGetProductList = jest
      .fn()
      .mockReturnValue(Promise.resolve(expectedProducts));
    MockProductService.mockImplementation(
      () =>
        (({
          getProductList: mockedGetProductList,
        } as unknown) as ProductService)
    );

    const result = await getProductsList(event, null, null);

    expect(mockedGetProductList).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      statusCode: 200,
      body: buildBody(expectedProducts),
    });
  });

  it("should return 500 if there is internal server error", async () => {
    const event = ({} as unknown) as APIGatewayProxyEvent;
    const mockedGetProductList = jest.fn().mockReturnValue(Promise.reject());
    MockProductService.mockImplementation(
      () =>
        (({
          getProductList: mockedGetProductList,
        } as unknown) as ProductService)
    );

    const result = await getProductsList(event, null, null);

    expect(mockedGetProductList).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      statusCode: 500,
      body: null,
    });
  });
});
