import { db } from "@/db/index.js";
import { retro_sessions, RetroSessionCreate } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { Request, Response, Router } from "express";

const retroSessionRouter = Router();

retroSessionRouter.get("/", async (_: Request, res: Response) => {
  const response = await db.select().from(retro_sessions);
  return res.json(response);
});

retroSessionRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const [session] = await db
    .select()
    .from(retro_sessions)
    .where(eq(retro_sessions.id, String(id)));

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json({ session: session });
});

retroSessionRouter.post("/", async (req: Request, res: Response) => {
  const { session_name, meeting_link } = req.body as Omit<
    RetroSessionCreate,
    "id"
  >;
  const createdItem = await db
    .insert(retro_sessions)
    .values({
      session_name,
      meeting_link,
    })
    .returning();

  return res.json({ createdItem });
});

retroSessionRouter.patch("/", async (req: Request, res: Response) => {
  const { session_name, meeting_link } = req.body as Omit<
    RetroSessionCreate,
    "id"
  >;

  const createdItem = await db
    .insert(retro_sessions)
    .values({
      session_name,
      meeting_link,
    })
    .returning();

  return res.json({ createdItem });
});

export default retroSessionRouter;
