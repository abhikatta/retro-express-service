import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const retro_sessions = pgTable("retro_sessions", {
  id: uuid("id").defaultRandom().primaryKey().unique().notNull(),
  session_name: text("session_name"),
  meeting_link: text("meeting_link"),
});

export const retroItemTypeEnum = pgEnum("retro_item_type", [
  "positive",
  "improvement",
  "action_item",
]);
export const retro_items = pgTable("retro_items", {
  id: uuid("id").primaryKey().defaultRandom().unique().notNull(),
  type: retroItemTypeEnum("type").notNull(),
  description: text("description").notNull(),
  session_id: uuid("session_id")
    .references(() => retro_sessions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  last_created_or_updated_at: timestamp("last_created_or_updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export interface AIGroupItem {
  summary: string;
  groupItemsIds: string[];
}
export type AIGroups = AIGroupItem[];
export const ai_groups = pgTable("ai_groups", {
  session_id: uuid("session_id")
    .unique()
    .notNull()
    .primaryKey()
    .references(() => retro_sessions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  groups: jsonb("groups").$type<AIGroups>().notNull(),
  is_stale: boolean("is_stale").default(false).notNull(),
});

export type RetroItem = typeof retro_items.$inferSelect;
export type RetroItemCreate = Omit<
  RetroItem,
  "id" | "last_created_or_updated_at"
>;
export type RetroItemUpdate = Omit<
  RetroItem,
  "id" | "last_created_or_updated_at" | "session_id"
>;

export type RetroSession = typeof retro_sessions.$inferSelect;
export type RetroSessionCreate = Omit<RetroSession, "id">;

export type RetroItemAIGroups = typeof ai_groups.$inferSelect;
