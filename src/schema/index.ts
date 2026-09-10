import { relations, defineRelations } from "drizzle-orm";
import { pgSchema, pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

const retro_schema = pgSchema("retro_schema");

export const retro_sessions = pgTable("retro_sessions", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  session_name: text("session_name"),
  meeting_link: text("meeting_link"),
});

const retro_items_types = retro_schema.enum("retro_items_types", [
  "positive",
  "improvement",
  "action_item",
]);

export const retro_items = pgTable("retro_items ", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: retro_items_types("type").notNull(),
  description: text("description").notNull(),
  session: uuid("session_id")
    .references(() => retro_sessions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  createdOrLastUpdatedAt: timestamp("created_or_last_updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

// export const retro_sessions_relations = relations(
//   retro_sessions,
//   ({ many }) => ({
//     retro_items: many(retro_items),
//   }),
// );

export const retro_sessions_relations = defineRelations({});
