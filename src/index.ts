import express, { Request, Response } from "express";
import { pool } from "./core/db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Basic async route
app.get("/api/health", async (req: Request, res: Response) => {
  // If a database call fails here, Express 5 natively catches the error
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/users/me", (req, res) => {
  res.json({ "This is me!": "asd" });
});
app.get("/users/:id", (req, res) => {
  res.send({ "User ID: ": req.params.id });
});

app.get("/api/users/", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM users");
  res.status(201).json(result.rows[0]);
});

app.post("/api/users/create", async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const result = await pool.query(
    "INSERT INTO users (name,email) VALUES ($1, $2) RETURNING *",
    [name, email],
  );
  res.status(201).json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
