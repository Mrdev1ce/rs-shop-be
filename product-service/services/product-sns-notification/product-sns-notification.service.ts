import { SNS } from "aws-sdk";
import { DEFAULT_REGION } from "../../../core/env.config";
import { Product } from "../../../core/types";
import { config } from "../../common/config";

export class ProductSnsNotificationService {
    private sns = new SNS({ region: DEFAULT_REGION });
    private CRITICAL_STOCK_COUNT = 1;

    public notify(products: Product[]) {
        const notifyAllPromise = this.notifyAllCreated(products);
        const notifyOutOfStockPromise = this.notifyOutOfStock(products);
        return Promise.all([notifyAllPromise, notifyOutOfStockPromise]);
    }

    private notifyAllCreated(products: Product[]) {
        return this.publish({
            Subject: "[RS-SHOP] Created products",
            Message: JSON.stringify(products),
        });
    }

    private notifyOutOfStock(products: Product[]) {
        const outOfStockProducts = products.filter((product) => product.count <= this.CRITICAL_STOCK_COUNT);
        const serializedOutOfStockProducts = JSON.stringify(outOfStockProducts);
        const message = `Warning! The products below are almost out of stock\n${serializedOutOfStockProducts}`;

        return this.publish({
            Subject: "[RS-SHOP] Created out of stock products",
            Message: message,
            MessageAttributes: {
                outOfStock: { DataType: "String", StringValue: "true" }
            },
        })
    }

    private publish(params: Omit<SNS.Types.PublishInput, 'TopicArn'>) {
        return this.sns.publish({
            ...params,
            TopicArn: config.CREATE_PRODUCT_TOPIC_ARN
        }).promise();
    }
}