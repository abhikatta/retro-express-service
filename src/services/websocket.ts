import { RetroItem, RetroSession } from "@/db/schema.js";
import WebSocket, { WebSocketServer } from "ws";

type WebSocketEvent =
  | "retro_item_created"
  | "retro_item_deleted"
  | "retro_item_updated"
  | "participants_updated";

interface ParticipantsEvent {
  event: Extract<WebSocketEvent, "participants_updated">;
  total_participants: number;
}

interface RetroItemEvent {
  event: Exclude<WebSocketEvent, "participants_updated">;
  retro_item: RetroItem;
}

type BroadcastEvent = ParticipantsEvent | RetroItemEvent;

const connections = new Map<string, WebSocket[]>();
const disconnectConnections = new Set<WebSocket>();
const wss = new WebSocketServer({ port: 8000 });

wss.on("connection", (socket, req) => {
  console.log(req);
  const sessionId = req.url || "";

  socket.on("open", () => {
    addConnection(sessionId, socket);
  });
  socket.on("close", () => {
    removeConnection(sessionId, socket);
  });
});

export const addConnection = (
  sesssionId: RetroSession["id"],
  socket: WebSocket,
) => {
  const sessionConnections = connections.get(sesssionId);
  if (sessionConnections) {
    sessionConnections.push(socket);
  } else {
    connections.set(sesssionId, [socket]);
  }

  broadCastToConnections(sesssionId, {
    event: "participants_updated",
    total_participants: connections.get(sesssionId)?.length || 1,
  });
};

export const removeConnection = (
  sessionId: RetroItem["session_id"],
  websocket: WebSocket,
) => {
  const sessionConnections = connections.get(sessionId);
  if (!sessionConnections) connections.delete(sessionId);
  else sessionConnections?.filter((event) => websocket !== event);

  broadCastToConnections(sessionId, {
    total_participants: sessionConnections?.length || 0,
    event: "participants_updated",
  });
};

export const broadCastToConnections = (
  sessionId: RetroItem["session_id"],
  message: BroadcastEvent,
) => {
  const broadcastMessage = JSON.stringify({ ...message });
  const sessionConnections = connections.get(sessionId);
  if (!sessionConnections) return;

  for (const connection of sessionConnections) {
    try {
      if (connection.readyState === connection.OPEN) {
        connection.send(broadcastMessage);
      }
    } catch (error) {
      disconnectConnections.add(connection);
    }
  }
  for (const con of disconnectConnections) {
    removeConnection(sessionId, con);
  }
};
