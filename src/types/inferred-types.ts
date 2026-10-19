import { RetroItem, RetroItemAIGroups } from "@/db/schema.js";

export interface ParticipantsEvent {
  event: "participants_updated";
  total_participants: number;
}

export interface RetroItemEvent {
  event: "retro_item_created" | "retro_item_deleted" | "retro_item_updated";
  retro_item: RetroItem;
}

export interface AIRetroItemGroupEvent {
  event: "ai_item_groups_updated";
  itemGroups: RetroItemAIGroups;
}

export type BroadcastEvent =
  | ParticipantsEvent
  | RetroItemEvent
  | AIRetroItemGroupEvent;
