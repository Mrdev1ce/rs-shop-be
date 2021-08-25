import { productDAL } from "./product.dynamo.dal";
import { Product } from "../../../core/types";

export class ProductService {
  public async getProductList(): Promise<Product[]> {
    return productDAL.getAll();
  }

  public async getProductById(id: string): Promise<Product | null> {
    return productDAL.getById(id);
  }

  public async createProduct(product: Product): Promise<Product> {
    return productDAL.create(product);
  }

  public async createProducts(products: Product[]): Promise<Product[]> {
    return productDAL.createBatch(products);
  }
}
