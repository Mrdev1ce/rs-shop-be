import { Client } from "pg";
import { config } from "../../common/config";

import { ProductQueryBuilder } from "./product.queries";
import { Product } from "./types";

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
}

export const productDAL = new ProductDAL();
