type ProductId = string;

export type Product = {
  id: ProductId | null;
  title: string;
  description: string;
  price: number;
  count: number | null;
};

export type StockDB = {
  productId: ProductId;
  count: number;
};
