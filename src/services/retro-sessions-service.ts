import { db } from "@/db/index.js";
import {
  retro_sessions,
  RetroSession,
  RetroSessionCreate,
} from "@/db/schema.js";
import { eq } from "drizzle-orm";

export const getRetroSessionItem = async (
  id: string,
): Promise<RetroSession | null> => {
  const [session] = await db
    .select()
    .from(retro_sessions)
    .where(eq(retro_sessions.id, id));

  return session;
};

export const createRetroSession = async ({
  session_name,
  meeting_link,
}: RetroSessionCreate): Promise<RetroSession> => {
  const [createdItem] = await db
    .insert(retro_sessions)
    .values({
      session_name,
      meeting_link,
    })
    .returning();

  return createdItem;
};

export const updateRetroSession = async ({
  session_name,
  meeting_link,
  id,
}: RetroSession): Promise<RetroSession | null> => {
  const session = db
    .select()
    .from(retro_sessions)
    .where(eq(retro_sessions.id, id));

  if (!session) return null;

  const [updatedItem] = await db
    .update(retro_sessions)
    .set({
      session_name,
      meeting_link,
    })
    .where(eq(retro_sessions.id, id))
    .returning();

  return updatedItem;
};
