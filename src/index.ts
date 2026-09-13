import "@/services/websocket.js";
import cors from "cors";
import express from "express";
import retroItemRoutes from "./routes/retro-items-route.js";
import retroSessionRoutes from "./routes/retro-sessions-route.js";
import websocketRoutes from "./routes/websocket-route.js";
import { WebSocketServer } from "ws";
import {
  addConnection,
  broadCastToConnections,
  connections,
  removeConnection,
} from "@/services/websocket.js";

const app = express();
export const PORT = parseInt(process.env.PORT || "") || 8000;

app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: process.env.URL || "http://localhost:5173",
  }),
);

app.use("/session", retroSessionRoutes);
app.use("/sessions", retroItemRoutes);
app.use("/get-retro-items", websocketRoutes);

app.get("/", (_, res) => {
  res.json({ home: "." });
});

export const server = app.listen(PORT, () => {
  console.log(`[src/index] Server running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (socket, req) => {
  console.log("Starting WebSocket server...");
  const sessionId = req.url?.split("/").pop();

  if (!sessionId) {
    socket.close();
    return;
  }

  addConnection(sessionId, socket);

  broadCastToConnections(sessionId, {
    event: "participants_updated",
    total_participants: connections.get(sessionId)?.length || 0,
  });

  socket.on("close", () => {
    removeConnection(sessionId, socket);
    broadCastToConnections(sessionId, {
      total_participants: connections.get(sessionId)?.length || 0,
      event: "participants_updated",
    });
  });
});

export default app;
