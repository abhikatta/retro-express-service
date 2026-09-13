import { RetroItem, RetroItemCreate } from "@/db/schema.js";
import {
  createRetroItem,
  deleteRetroItem,
  getAllRetroItems,
  getAllRetroItemsFromAllSessions,
  getRetroItem,
  updateRetroItem,
} from "@/services/retro-items-service.js";
import { getRetroSessionItem } from "@/services/retro-sessions-service.js";
import { Request, Response, Router } from "express";
import z from "zod";

const retroItemRouter = Router();
const typeSchema = z.enum(["positive", "improvement", "action_item"]);
const descriptionSchema = z.string().max(200).min(5).trim().nonempty();

// TODO: remove later
retroItemRouter.get("/retro-items", async (_: Request, res: Response) => {
  const retro_items = await getAllRetroItemsFromAllSessions();
  return res.json({ retro_items });
});

retroItemRouter.get(
  "/:sessionId/retro-items",
  async (req: Request<{ sessionId: string }>, res: Response) => {
    const { sessionId } = req.params;
    const session = await getRetroSessionItem(sessionId);
    if (!session)
      return res.json(400).json({ error: "Session does not exist" });
    const retro_items = await getAllRetroItems(sessionId);
    return res.json(retro_items);
  },
);

retroItemRouter.post(
  "/:sessionId/retro-items",
  async (
    req: Request<{ sessionId: string }, RetroItem, RetroItemCreate>,
    res: Response,
  ) => {
    const { sessionId } = req.params;
    const { description, type, session_id: itemSessionId } = req.body;
    const session = await getRetroSessionItem(sessionId);
    if (!session)
      return res.status(404).json({ error: "Session does not exist" });

    console.log(sessionId, itemSessionId);
    if (sessionId !== itemSessionId) {
      return res
        .status(400)
        .json({ error: "Session ID does not match provided retro item's Id" });
    }

    if (!typeSchema.safeParse(type).success)
      return res
        .status(400)
        .json({ error: "Item's type is not a valid retro item type" });
    if (!descriptionSchema.safeParse(description).success)
      return res.status(400).json({
        error: "Item's description should be in range 5-200 characters",
      });

    const retro_item = await createRetroItem({
      description,
      type,
      session_id: sessionId,
    });
    return res.json({ retro_item });
  },
);

retroItemRouter.get(
  "/:sessionId/retro-items/",
  async (
    req: Request<
      { sessionId: string },
      RetroItem | { error: string },
      RetroItem
    >,
    res: Response,
  ) => {
    const { sessionId } = req.params;
    const session = await getRetroSessionItem(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session does not exist" });
    }

    const retroItems = await getAllRetroItems(sessionId);

    return res.json({ retro_items: retroItems });
  },
);

retroItemRouter.get(
  "/:sessionId/retro-items/:id",
  async (
    req: Request<
      { sessionId: string; id: string },
      RetroItem | { error: string },
      RetroItem
    >,
    res: Response,
  ) => {
    const { sessionId, id } = req.params;
    const session = await getRetroSessionItem(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session does not exist" });
    }

    const retroItem = await getRetroItem(sessionId, id);

    if (!retroItem)
      return res.status(404).json({ error: "Item does not exist" });
    return res.json({ retro_item: retroItem });
  },
);

retroItemRouter.patch(
  "/:sessionId/retro-items/:id",
  async (
    req: Request<{ sessionId: string; id: string }, any, RetroItemCreate>,
    res: Response,
  ) => {
    const { sessionId, id } = req.params;
    const { description, type, session_id: retroItemSessionId } = req.body;

    if (sessionId !== retroItemSessionId) {
      return res
        .status(400)
        .json({ error: "Session ID does not match provided retro item's Id" });
    }

    const session = await getRetroSessionItem(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session does not exist" });
    }
    const retroItem = await getRetroItem(sessionId, id);

    if (!retroItem)
      return res.status(404).json({ error: "Item does not exist" });

    const updatedRetroItem = await updateRetroItem(sessionId, id, {
      description,
      type,
      session_id: sessionId,
    });

    return res.json({ retro_item: updatedRetroItem });
  },
);

retroItemRouter.delete(
  "/:sessionId/retro-items/:id",
  async (
    req: Request<{ sessionId: string; id: string }, any, null>,
    res: Response,
  ) => {
    const { sessionId, id } = req.params;
    const retroItem = await getRetroItem(sessionId, id);

    if (!retroItem)
      return res.status(404).json({ error: "Item does not exist" });

    const deletedRetroItem = await deleteRetroItem(sessionId, id);
    return res.json({ retro_item: deletedRetroItem });
  },
);

export default retroItemRouter;
