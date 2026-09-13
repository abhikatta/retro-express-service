import { getAllRetroItems } from "@/services/retro-items-service.js";
import { Router, Request, Response } from "express";

const websocketRouter = Router();

websocketRouter.get(
  "/:sessionId",
  async (req: Request<{ sessionId: string }>, res: Response) => {
    const { sessionId } = req.params;

    const retroItems = await getAllRetroItems(sessionId);
    if (retroItems) return res.json(retroItems);
    else return res.json([]);
  },
);

export default websocketRouter;
