import { Pool } from "pg";
import dotnenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

dotnenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("[pool] database connected");
});

pool.on("error", () => {
  console.log("[pool] database connect error");
});

export const db = drizzle({ client: pool, schema });
