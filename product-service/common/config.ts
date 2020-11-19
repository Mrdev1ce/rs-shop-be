const {
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USERNAME,
  PG_PASSWORD,
  PRODUCTS_QUEUE_URL,
} = process.env;

export const config = {
  db: {
    PG_HOST,
    PG_PORT: +PG_PORT,
    PG_DATABASE,
    PG_USERNAME,
    PG_PASSWORD,
  },
  PRODUCTS_QUEUE_URL,
};
