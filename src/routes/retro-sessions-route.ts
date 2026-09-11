import { db } from "@/db/index.js";
import { retro_sessions, RetroSessionCreate } from "@/db/schema.js";
import {
  createRetroSession,
  getRetroSessionItem,
  updateRetroSession,
} from "@/services/retro-sessions-service.js";
import { Request, Response, Router } from "express";
import z from "zod";

const retroSessionRouter = Router();

const idSchema = z.uuid();
const meetingLinkSchema = z.url();

// TODO: remove later
retroSessionRouter.get("/", async (_: Request, res: Response) => {
  const session = await db.select().from(retro_sessions);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json({ session });
});

retroSessionRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const validation = idSchema.safeParse(id);

  if (!validation.success) {
    return res.status(400).json({ error: "Invalid session id" });
  }

  const session = await getRetroSessionItem(id as string);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json({ session });
});

retroSessionRouter.post("/", async (req: Request, res: Response) => {
  const { session_name, meeting_link }: RetroSessionCreate = req.body;

  if (meeting_link && !meetingLinkSchema.safeParse(meeting_link).success) {
    return res.status(400).json({ error: "Invalid meeting link" });
  }

  const createdItem = await createRetroSession({
    session_name,
    meeting_link,
  });

  return res.json({ session: createdItem });
});

retroSessionRouter.patch("/:id", async (req: Request, res: Response) => {
  if (
    !req.body ||
    (!("meeting_link" in req.body) && !("session_name" in req.body))
  )
    return res.status(400).json({ error: "Missing update fields" });

  if (
    req.body.meeting_link &&
    !meetingLinkSchema.safeParse(req.body.meeting_link).success
  ) {
    return res.status(400).json({ error: "Invalid meeting link" });
  }

  const { session_name, meeting_link }: RetroSessionCreate = req.body;
  const { id } = req.params;
  const validation = idSchema.safeParse(id);

  if (!validation.success) {
    return res.status(400).json({ error: "Invalid session id" });
  }
  const updatedItem = await updateRetroSession({
    session_name,
    meeting_link,
    id: id as string,
  });
  if (!updatedItem) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json({ session: updatedItem });
});

export default retroSessionRouter;
