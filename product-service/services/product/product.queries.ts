import { QueryConfig } from "pg";
import format from "pg-format";
import { Product, StockDB } from "../../../core/types";

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

  public buildCreateProductsQuery(products: Product[]): QueryConfig {
    const values = products.map((product) => {
      return [product.title, product.description, product.price];
    });
    return {
      name: "createProducts",
      text: format(
        "insert into products (title, description, price) values %L returning id",
        values
      ),
    };
  }

  public buildCreateStocksQuery(stocks: StockDB[]): QueryConfig {
    const values = stocks.map((stock) => {
      return [stock.productId, stock.count];
    });
    return {
      name: "createStock",
      text: format("insert into stocks (product_id, count) values %L", values),
    };
  }
}
