import { QueryConfig } from "pg";
import { Product } from "./types";

export class ProductQueryBuilder {
  public buildGetAllQuery(): QueryConfig {
    return {
      name: "getAllProducts",
      text:
        "select p.id, p.title, p.description, p.price, s.count from products p left join stocks s on p.id = s.product_id",
    };
  }

  public buildGetByIdQuery(id: string): QueryConfig<[string]> {
    return {
      name: "getProductById",
      text:
        "select p.id, p.title, p.description, p.price, s.count from products p left join stocks s on p.id = s.product_id where p.id = $1",
      values: [id],
    };
  }

  public buildCreateProductQuery({
    title,
    description,
    price,
  }: Product): QueryConfig<[string, string, number]> {
    return {
      name: "createProduct",
      text:
        "insert into products (title, description, price) values ($1, $2, $3) returning *",
      values: [title, description, price],
    };
  }

  public buildCreateStockQuery(
    productId: string,
    count: number
  ): QueryConfig<[string, number]> {
    return {
      name: "createStock",
      text:
        "insert into stocks (product_id, count) values ($1, $2) returning *",
      values: [null, count],
    };
  }
}
