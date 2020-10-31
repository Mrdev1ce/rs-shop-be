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

  public async getProductList(): Promise<Product[]> {
    return this.products;
  }

  public async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }
}
