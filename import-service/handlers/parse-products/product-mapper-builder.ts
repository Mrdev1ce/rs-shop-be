import { FieldsMapper } from "./fields-mapper";
import { Product } from "../../../core/types";

export class ProductMapperBuilder extends FieldsMapper<Product> {
  private static parseNumber(value: unknown) {
    if (value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  constructor() {
    super({
      price: ProductMapperBuilder.parseNumber,
      count: ProductMapperBuilder.parseNumber,
    });
  }
}
