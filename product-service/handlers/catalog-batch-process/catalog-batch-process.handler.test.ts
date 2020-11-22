import { catalogBatchProcess } from "./catalog-batch-process.handler";
import { SQSEvent } from "aws-lambda";
import { ProductService } from "../../services/product/product.service";
import { ProductSnsNotificationService } from "../../services/product-sns-notification/product-sns-notification.service";

jest.mock("../../services/product/product.service");
jest.mock(
  "../../services/product-sns-notification/product-sns-notification.service"
);

const MockProductService = ProductService as jest.MockedClass<
  typeof ProductService
>;
const MockProductNotificationSerice = ProductSnsNotificationService as jest.MockedClass<
  typeof ProductSnsNotificationService
>;

describe("catalogBatchProcess handler", () => {
  beforeEach(() => {
    MockProductService.mockClear();
    MockProductNotificationSerice.mockClear();
  });
  it("should call service to create products", async () => {
    const products = [
      {
        title: "test",
        description: "descr",
        count: 10,
        price: 22,
      },
      {
        title: "test1",
        description: "descr1",
        count: 2,
        price: 3,
      },
    ];
    const event = ({
      Records: products.map((product) => ({
        body: JSON.stringify(product),
      })),
    } as unknown) as SQSEvent;
    const mockedCreateProducts = jest
      .fn()
      .mockReturnValue(Promise.resolve(products));
    MockProductService.mockImplementation(
      () =>
        (({
          createProducts: mockedCreateProducts,
        } as unknown) as ProductService)
    );
    const mockedNotify = jest.fn().mockReturnValue(Promise.resolve());
    MockProductNotificationSerice.mockImplementation(
      () =>
        (({
          notify: mockedNotify,
        } as unknown) as ProductSnsNotificationService)
    );

    await catalogBatchProcess(event, null, null);

    expect(mockedCreateProducts).toHaveBeenCalledTimes(1);
    expect(mockedCreateProducts).toHaveBeenCalledWith(products);
    expect(mockedNotify).toHaveBeenCalledTimes(1);
    expect(mockedNotify).toHaveBeenCalledWith(products);
  });

  it("should handle errors", async () => {
    const event = ({
      Records: [
        {
          body: "Invalid json",
        },
      ],
    } as unknown) as SQSEvent;
    const result = catalogBatchProcess(event, null, null);

    await expect(result).resolves.toBeUndefined();
  });
});
