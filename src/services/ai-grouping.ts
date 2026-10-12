import { promptAI } from "@/providers/ai-provider.js";
import { getAllRetroItems } from "./retro-items-service.js";

const responseType = [
  {
    summary: "a short 1 line sentence explaning why the items are grouped",
    groupItemsIds: "array of item ids that are grouped based on items provided",
  },
];

export const generatePrompt = async (sessionId: string) => {
  const items = JSON.stringify((await getAllRetroItems(sessionId)) || "");
  return `Group the items baesd on content similarity and give response in the shape of ${JSON.stringify(responseType)} per group for following items. Response must follow the shape provided and if only part of the items are similar the summary should also mention it.\n\n.ITEMS:\n ${items}`;
};

const AIGrouping = async (sessionId: string) =>
  await promptAI(await generatePrompt(sessionId));

export default AIGrouping;
