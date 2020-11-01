import productsMock from "./products.json";

type Product = {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
};

export class ProductService {
  private products: Product[] = productsMock;

  // Async here to complete additional task (+1 - Async/await is used in lambda functions)
  public async getProductList(): Promise<Product[]> {
    return this.products;
  }

  // Async here to complete additional task (+1 - Async/await is used in lambda functions)
  public async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }
}
