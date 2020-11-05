import { QueryConfig } from "pg";

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
}
