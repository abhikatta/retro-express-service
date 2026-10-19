import { AIGroups, RetroItem } from "@/db/schema.js";
import { cleanUpAIHallucinatedIds } from "@/services/ai-grouping-service.js";

import { expect, test } from "vitest";

const mock: AIGroups = [
  {
    summary: "bla bla bla",
    groupItemsIds: ["1", "313", "4"], // 4 does not exist
  },
  {
    summary: "bla bla bla",
    groupItemsIds: ["11", "113", "41"],
  },
  {
    summary: "bla bla bla",
    groupItemsIds: ["111", "13", "44"], // 13 does not exist
  },
  {
    summary: "bla bla bla",
    groupItemsIds: ["1111", "13", "4"], // 1111, exists but 13, 4 do not exist => only 1 id => this object should be deleted
  },
];

const mockCleanUpRes: AIGroups = [
  {
    summary: "bla bla bla",
    groupItemsIds: ["1", "313"],
  },
  {
    summary: "bla bla bla",
    groupItemsIds: ["11", "113", "41"],
  },
  {
    summary: "bla bla bla",
    groupItemsIds: ["111", "44"],
  },
];

const mockRetroItems: RetroItem[] = [
  {
    id: "1",
    type: "positive",
    description: "Frontend team did great on the UI!!",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "313",
    type: "improvement",
    description: "I think Frontend team did good on the UI",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "11",
    type: "action_item",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "113",
    type: "improvement",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "41",
    type: "improvement",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "111",
    type: "positive",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "44",
    type: "positive",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
  {
    id: "1111",
    type: "positive",
    description: "Frontend team was great. UI was awesome. Great job on that",
    session_id: "5c0ddb21-b2ae-48d1-bf38-1d599d6ec462",
    last_created_or_updated_at: new Date(),
  },
];

test("remove ids if they dont exist in db", () => {
  expect(cleanUpAIHallucinatedIds(mock, mockRetroItems)).toEqual(
    mockCleanUpRes,
  );
});
