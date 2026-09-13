import { RetroItem, RetroItemCreate } from "@/db/schema.js";
import {
  createRetroItem,
  deleteRetroItem,
  getAllRetroItems,
  getRetroItem,
  updateRetroItem,
} from "@/services/retro-items-service.js";
import { getRetroSessionItem } from "@/services/retro-sessions-service.js";
import { broadCastToConnections } from "@/services/websocket.js";
import { Request, Response, Router } from "express";
import z from "zod";

const retroItemRouter = Router();
const typeSchema = z.enum(["positive", "improvement", "action_item"]);
const descriptionSchema = z.string().max(200).min(5).trim().nonempty();

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
    const { description, type } = req.body;
    const session = await getRetroSessionItem(sessionId);
    if (!session)
      return res.status(404).json({ error: "Session does not exist" });

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

    broadCastToConnections(sessionId, {
      event: "retro_item_created",
      retro_item,
    });

    return res.json(retro_item);
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
    return res.json(retroItem);
  },
);

retroItemRouter.patch(
  "/:sessionId/retro-items/:id",
  async (
    req: Request<{ sessionId: string; id: string }, any, RetroItemCreate>,
    res: Response,
  ) => {
    const { sessionId, id } = req.params;
    const { description, type } = req.body;

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
    });

    broadCastToConnections(sessionId, {
      event: "retro_item_updated",
      retro_item: updatedRetroItem,
    });

    return res.json(updatedRetroItem);
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

    broadCastToConnections(sessionId, {
      event: "retro_item_deleted",
      retro_item: deletedRetroItem,
    });

    return res.json(deletedRetroItem);
  },
);

export default retroItemRouter;
