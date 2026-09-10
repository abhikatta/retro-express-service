import { Pool } from "pg";
import dotnenv from "dotenv";

dotnenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

