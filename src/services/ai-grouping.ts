import { RetroItem } from "@/db/schema.js";
import {
  AIServiceError,
  SessionNotFoundError,
  TooFewItemsError,
} from "@/errors.js";
import { promptAI } from "@/providers/ai-provider.js";
import { getAllRetroItems } from "./retro-items-service.js";
import { getRetroSessionItem } from "./retro-sessions-service.js";
import { AIRetroItemGroupEvent } from "./websocket.js";

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

export const cleanUpAIHallucinatedIds = (
  AIGroups: AIRetroItemGroupEvent["itemGroups"],
  retroItems: RetroItem[],
): AIRetroItemGroupEvent["itemGroups"] => {
  const retroItemIds = new Set(retroItems.map((item) => item.id));

  const res = AIGroups.map((group) => {
    const filteredIds = [...new Set(group.groupItemsIds)].filter((i) =>
      retroItemIds.has(i),
    );
    return { ...group, groupItemsIds: filteredIds };
  });

  return res.filter((item) => item.groupItemsIds.length > 1);
};

const AIGrouping = async (
  sessionId: string,
): Promise<AIRetroItemGroupEvent["itemGroups"]> => {
  const session = await getRetroSessionItem(sessionId);
  if (!session) {
    throw new SessionNotFoundError("Session not found!");
  }
  const retroItems = await getAllRetroItems(sessionId);
  const items = retroItems.map((item) => ({
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

  const parsedRes = JSON.parse(text);
  if (Array.isArray(parsedRes) && parsedRes.length >= 1) {
    const cleanedRes: AIRetroItemGroupEvent["itemGroups"] =
      cleanUpAIHallucinatedIds(parsedRes, retroItems);

    return cleanedRes;
  } else
    throw new AIServiceError("Something went wrong! Please try again later.");
};

export default AIGrouping;
