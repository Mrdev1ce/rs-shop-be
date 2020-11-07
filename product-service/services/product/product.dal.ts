import { Client } from "pg";
import { config } from "../../common/config";

import { ProductQueryBuilder } from "./product.queries";
import { Product, StockDB } from "./types";

const { db } = config;

class ProductDAL {
  private queryBuilder: ProductQueryBuilder;
  constructor() {
    this.queryBuilder = new ProductQueryBuilder();
  }

  static buildPgClient(): Client {
    return new Client({
      host: db.PG_HOST,
      port: db.PG_PORT,
      database: db.PG_DATABASE,
      user: db.PG_USERNAME,
      password: db.PG_PASSWORD,
    });
  }

  async getAll(): Promise<Product[]> {
    const client = ProductDAL.buildPgClient();
    await client.connect();

    const query = this.queryBuilder.buildGetAllQuery();
    const data = await client.query<Product>(query);

    await client.end();

    return data.rows;
  }

  async getById(id: string): Promise<Product | null> {
    const client = ProductDAL.buildPgClient();
    await client.connect();

    const query = this.queryBuilder.buildGetByIdQuery(id);
    const data = await client.query<Product>(query);

    await client.end();

    return data.rows[0] ?? null;
  }

  async create(product: Product): Promise<Product> {
    const client = ProductDAL.buildPgClient();
    await client.connect();

    try {
      await client.query("BEGIN");
      const createProduct = await this.createProduct(client, product);
      const createdStock = await this.createStock(
        client,
        createProduct.id,
        product.count
      );
      await client.query("COMMIT");

      return {
        ...createProduct,
        count: createdStock.count,
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      await client.end();
    }
  }

  private async createProduct(
    client: Client,
    product: Product
  ): Promise<Product> {
    const createProductQuery = this.queryBuilder.buildCreateProductQuery(
      product
    );
    const { rowCount, rows } = await client.query<Product>(createProductQuery);
    const createdProduct = rows[0];

    if (rowCount !== 1 || createdProduct == null || createdProduct.id == null) {
      throw new Error("Unable to create product");
    }

    return createdProduct;
  }

  private async createStock(
    client: Client,
    productId: string,
    count: number
  ): Promise<StockDB> {
    const createStockQuery = this.queryBuilder.buildCreateStockQuery(
      productId,
      count
    );
    const { rowCount, rows } = await client.query<StockDB>(createStockQuery);
    const createdStock = rows[0];

    if (rowCount !== 1 || createdStock == null) {
      throw new Error("Unable to create stock");
    }

    return createdStock;
  }
}

export const productDAL = new ProductDAL();
