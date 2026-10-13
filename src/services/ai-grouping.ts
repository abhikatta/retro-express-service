import { promptAI } from "@/providers/ai-provider.js";
import { AIRetroItemGroupEvent } from "./websocket.js";
import { getAllRetroItems } from "./retro-items-service.js";
import {
  AIServiceError,
  SessionNotFoundError,
  TooFewItemsError,
} from "@/errors.js";
import { getRetroSessionItem } from "./retro-sessions-service.js";

const responseType = [
  {
    summary: "a short 1 line sentence explaining why the items are grouped",
    groupItemsIds: "array of item ids that are grouped based on items provided",
  },
];

export const generatePrompt = (items: string) =>
  `Group the items based on content similarity and give response in the shape of ${JSON.stringify(responseType)} 
  per group for following items. Response must follow the shape provided and if only part of the items are similar the 
  summary should also mention it. Raw JSON only, no markdown fences, no prose. \n\n.ITEMS:\n ${items}`;

const AIGrouping = async (
  sessionId: string,
): Promise<AIRetroItemGroupEvent["itemGroups"]> => {
  const session = await getRetroSessionItem(sessionId);
  if (!session) {
    throw new SessionNotFoundError("Session not found!");
  }

  const items = (await getAllRetroItems(sessionId)).map((item) => ({
    id: item.id,
    type: item.type,
    description: item.description,
  }));
  if (items.length <= 1) {
    throw new TooFewItemsError("Too few Retro items for AI grouping.");
  }

  const stringifiedItems = JSON.stringify(items);
  const text = await promptAI(generatePrompt(stringifiedItems));
  if (!text) {
    throw new AIServiceError("Something went wrong! Please try again later.");
  }

  /* TODO: verify if the ids actually exist in the db, if not remove them
    if the ids in an object are 0 or 1, delete that object itself with its summary */
  const parsedRes = JSON.parse(text);
  if (Array.isArray(parsedRes) && parsedRes.length >= 1)
    return parsedRes as AIRetroItemGroupEvent["itemGroups"];
  else
    throw new AIServiceError("Something went wrong! Please try again later.");
};

export default AIGrouping;
