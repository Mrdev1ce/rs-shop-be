import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Product } from "../../../core/types";
import {Logger} from "../../common/logger";

class ProductDynamoDal {
  private logger = new Logger("ProductDynamoDal");
  private productTableName = 'products-service';
  private dynamo = new AWS.DynamoDB.DocumentClient();

  async getAll(): Promise<Product[]> {
    const result = await this.dynamo.scan({
      TableName: this.productTableName
    }).promise();

    this.logger.info("Method: getAll. Got result from database: ", result)

    return result.Items as Product[];
  }

  async getById(id: string): Promise<Product | null> {
    const result = await this.dynamo.get({
      TableName: this.productTableName,
      Key: {id}
    }).promise();

    this.logger.info("Method: getById. Got result from database: ", result)

    return result.Item as Product ?? null;
  }

  async create(product: Product): Promise<Product> {
    const productToSave = {
      id: uuidv4(),
      ...product
    };
    const result = await this.dynamo.put({
      TableName: this.productTableName,
      Item: productToSave
    }).promise();

    this.logger.info("Method: create. Got result from database: ", result);

    return productToSave;
  }

  async createBatch(products: Product[]): Promise<Product[]> {
    const productsToSave = products.map((p) => ({
      id: uuidv4(),
      ...p,
    }));
    const result = await this.dynamo.transactWrite({
      TransactItems: productsToSave.map((p) => ({
        Put: {
          TableName: this.productTableName,
          Item: p
        }
      }))
    }).promise();

    this.logger.info("Method: create. Got result from database: ", result);

    return productsToSave;
  }
}

export const productDAL = new ProductDynamoDal();
