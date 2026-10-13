import {
  AIServiceError,
  SessionNotFoundError,
  TooFewItemsError,
} from "@/errors.js";
import AIGrouping from "@/services/ai-grouping.js";
import { broadCastToConnections } from "@/services/websocket.js";
import { Request, Response, Router } from "express";
import z from "zod";

const aiRouter = Router();
const idSchema = z.uuid();

aiRouter.get(
  "/grouping/:sessionId/",
  async (req: Request<{ sessionId: string }>, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId)
      return res.status(400).json({ detail: "Session ID is required" });

    const validation = idSchema.safeParse(sessionId);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid session id!" });
    }

    try {
      const groupedItems = await AIGrouping(sessionId);

      broadCastToConnections(sessionId, {
        event: "ai_item_groups_updated",
        itemGroups: groupedItems,
      });
      res.json({ detail: "Retro items are grouped!" });
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        return res.status(404).json({ error: "Session not found!" });
      } else if (error instanceof TooFewItemsError) {
        return res
          .status(400)
          .json({ error: "Too few retro items for AI grouping" });
      } else if (error instanceof AIServiceError) {
        return res
          .status(502)
          .json({ error: "Something went wrong! Please try again later." });
      } else {
        console.error("error in ai route:", error);
        throw error;
      }
    }
  },
);
export default aiRouter;
