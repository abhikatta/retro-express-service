import cors from "cors";
import express from "express";
import retroSessionRoutes from "./routes/retro-sessions-route.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: process.env.URL || "http://localhost:3000",
  }),
);

app.use("/api/session", retroSessionRoutes);

app.listen(PORT, () => {
  console.log(`[src/index] Server running on http://localhost:${PORT}`);
});

export default app;
