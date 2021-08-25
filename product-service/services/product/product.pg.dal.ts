import { Client } from "pg";
import { config } from "../../common/config";

import { ProductQueryBuilder } from "./product.queries";
import { Product, StockDB } from "../../../core/types";

const { db } = config;

class ProductPgDal {
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
    const client = ProductPgDal.buildPgClient();
    await client.connect();

    const query = this.queryBuilder.buildGetAllQuery();
    const data = await client.query<Product>(query);

    await client.end();

    return data.rows;
  }

  async getById(id: string): Promise<Product | null> {
    const client = ProductPgDal.buildPgClient();
    await client.connect();

    const query = this.queryBuilder.buildGetByIdQuery(id);
    const data = await client.query<Product>(query);

    await client.end();

    return data.rows[0] ?? null;
  }

  async create(product: Product): Promise<Product> {
    const client = ProductPgDal.buildPgClient();
    await client.connect();

    try {
      await client.query("BEGIN");
      const [createProduct] = await this.createProducts(client, [product]);
      const stock: StockDB = {
        productId: createProduct.id,
        count: product.count,
      };
      const [createdStock] = await this.createStocks(client, [stock]);
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

  async createBatch(products: Product[]): Promise<Product[]> {
    const client = ProductPgDal.buildPgClient();
    await client.connect();

    try {
      await client.query("BEGIN");
      const createdProducts = await this.createProducts(client, products);
      const stocks: StockDB[] = createdProducts.map((product) => ({
        productId: product.id,
        count: product.count,
      }));
      await this.createStocks(client, stocks);
      await client.query("COMMIT");

      return createdProducts;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      await client.end();
    }
  }

  private async createProducts(
    client: Client,
    products: Product[]
  ): Promise<Product[]> {
    const createProductQuery = this.queryBuilder.buildCreateProductsQuery(
      products
    );
    const { rowCount, rows } = await client.query<{ id: string }>(
      createProductQuery
    );

    if (rowCount !== products.length) {
      throw new Error("Unable to create products");
    }

    return products.map((product, i) => ({
      ...product,
      id: rows[i].id,
    }));
  }

  private async createStocks(
    client: Client,
    stocks: StockDB[]
  ): Promise<StockDB[]> {
    const createStockQuery = this.queryBuilder.buildCreateStocksQuery(stocks);
    const { rowCount } = await client.query(createStockQuery);

    if (rowCount !== stocks.length) {
      throw new Error("Unable to create stocks");
    }

    return stocks;
  }
}

export const productDAL = new ProductPgDal();
