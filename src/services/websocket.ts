import { RetroItem, RetroSession } from "@/db/schema.js";
import WebSocket from "ws";

interface ParticipantsEvent {
  event: "participants_updated";
  total_participants: number;
}

interface RetroItemEvent {
  event: "retro_item_created" | "retro_item_deleted" | "retro_item_updated";
  retro_item: RetroItem;
}

type BroadcastEvent = ParticipantsEvent | RetroItemEvent;

export const connections = new Map<string, WebSocket[]>();
export const disconnectConnections = new Set<WebSocket>();

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
};

export const removeConnection = (
  sessionId: RetroItem["session_id"],
  websocket: WebSocket,
) => {
  const sessionConnections = connections.get(sessionId);
  if (!sessionConnections) return;
  else {
    const remainingSessions = sessionConnections?.filter(
      (event) => websocket !== event,
    );
    connections.set(sessionId, remainingSessions);
  }
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
