const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

export const config = {
  db: {
    PG_HOST,
    PG_PORT: +PG_PORT,
    PG_DATABASE,
    PG_USERNAME,
    PG_PASSWORD,
  },
};
