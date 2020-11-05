import { productDAL } from "./product.dal";
import { Product } from "./types";

export class ProductService {
  public async getProductList(): Promise<Product[]> {
    return productDAL.getAll();
  }

  public async getProductById(id: string): Promise<Product | null> {
    return productDAL.getById(id);
  }
}
