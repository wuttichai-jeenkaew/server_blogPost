import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:123456@localhost:5432/blogpost",
});

export default connectionPool;