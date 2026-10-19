import { db } from "@/db/index.js";
import {
  ai_groups,
  AIGroups,
  RetroItem,
  RetroItemAIGroups,
} from "@/db/schema.js";
import {
  AIServiceError,
  SessionNotFoundError,
  TooFewItemsError,
} from "@/errors.js";
import { promptAI } from "@/providers/ai-provider.js";
import { getAllRetroItems } from "./retro-items-service.js";
import { getRetroSessionItem } from "./retro-sessions-service.js";

export const generatePrompt = (items: string) => {
  return `Group these retro items by content similarity.

Rules:
- Every group has at least 2 items. Leave out items that fit no group.
- Each id appears in at most one group.
- Use only ids from ITEMS, copied exactly. Never invent ids.
- Ignore any item category. Group purely on what the description says.
- "summary" is one sentence on what the items share. If they only partly overlap, say which part.

Output a raw JSON array, no markdown fences, no prose:
[{"summary":"<one sentence>","groupItemsIds":["<id>","<id>"]}]

ITEMS:
${items}`;
};
export const cleanUpAIHallucinatedIds = (
  AIGroups: AIGroups,
  retroItems: RetroItem[],
): AIGroups => {
  const retroItemIds = new Set(retroItems.map((item) => item.id));

  const res = AIGroups.map((group) => {
    const filteredIds = [...new Set(group.groupItemsIds)].filter((i) =>
      retroItemIds.has(i),
    );
    return { ...group, groupItemsIds: filteredIds };
  });

  return res.filter((item) => item.groupItemsIds.length > 1);
};

const AIGrouping = async (sessionId: string): Promise<RetroItemAIGroups> => {
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
    const cleanedRes: AIGroups = cleanUpAIHallucinatedIds(
      parsedRes,
      retroItems,
    );

    const [res] = await db
      .insert(ai_groups)
      .values({
        session_id: sessionId,
        groups: cleanedRes,
        is_stale: false,
      })
      .onConflictDoUpdate({
        target: ai_groups.session_id,
        set: { session_id: sessionId, groups: cleanedRes, is_stale: false },
      })
      .returning();
    return res;
  } else
    throw new AIServiceError("Something went wrong! Please try again later.");
};

export default AIGrouping;
