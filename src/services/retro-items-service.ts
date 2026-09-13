import { db } from "@/db/index.js";
import { retro_items, RetroItem, RetroItemCreate } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";

// TODO: remove later
export const getAllRetroItemsFromAllSessions = async () => {
  return db.select().from(retro_items);
};

export const getAllRetroItems = async (session_id: RetroItem["session_id"]) => {
  const items = await db
    .select()
    .from(retro_items)
    .where(eq(retro_items.session_id, session_id));
  return items || [];
};

export const createRetroItem = async (data: RetroItemCreate) => {
  const [retroItem] = await db
    .insert(retro_items)
    .values({
      description: data.description,
      type: data.type,
      session_id: data.session_id,
    })
    .returning();

  return retroItem;
};

export const getRetroItem = async (
  session_id: RetroItem["session_id"],
  id: RetroItem["id"],
) => {
  const [retroItem] = await db
    .select()
    .from(retro_items)
    .where(and(eq(retro_items.session_id, session_id), eq(retro_items.id, id)));

  if (!retroItem) return null;

  return retroItem;
};

export const updateRetroItem = async (
  session_id: RetroItem["session_id"],
  id: RetroItem["id"],
  data: RetroItemCreate,
) => {
  const retroItem = await getRetroItem(session_id, id);

  if (!retroItem) return null;

  const [updatedRetroItem] = await db
    .update(retro_items)
    .set({
      description: data.description,
      type: data.type,
    })
    .where(and(eq(retro_items.session_id, session_id), eq(retro_items.id, id)))
    .returning();

  return updatedRetroItem;
};
export const deleteRetroItem = async (
  session_id: RetroItem["session_id"],
  id: RetroItem["id"],
) => {
  const retroItem = await getRetroItem(session_id, id);

  if (!retroItem) return null;

  const [deletedRetroItem] = await db
    .delete(retro_items)
    .where(and(eq(retro_items.session_id, session_id), eq(retro_items.id, id)))
    .returning();

  return deletedRetroItem;
};
