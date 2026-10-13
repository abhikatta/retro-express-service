# 2026-10-12 (Monday) — abhikatta

## 13:24

- Added AI item grouping with Gemini (74aec19). New `src/providers/ai-provider.ts` calls `gemini-3.1-flash-lite` via `@google/genai` and JSON-parses the response into `itemGroups` with empty-summary fallback; new `src/services/ai-grouping.ts` builds a content-similarity prompt from all session items enforcing a `{summary, groupItemIds}` shape per group.
  Reason: manual grouping of retro notes doesn't scale as boards grow; automatic similarity grouping gives instant themes plus a one-line why per group.

- Broadcast `ai_item_groups_updated` on all retro-items CRUD (74aec19). GET / POST / GET-by-id / PATCH / DELETE in `retro-items-route.ts` now `res.json()` first, then fire-and-forget `void AIGrouping(sessionId).then(...broadcast...)`, with new `AIRetroItemGroupEvent` type in `websocket.ts`.
  Reason: keep API latency low (AI runs after response) while pushing fresh groups to all session sockets so clients stay in sync without polling.

- Fixed PORT fallback and WS connection handler (74aec19). `PORT` changed from `parseInt(process.env.PORT || "") || 8000` to `process.env.PORT ?? 8000`; `wss.on("connection")` made async.
  Reason: old parseInt forced a number and masked empty/invalid values; `??` preserves env-provided port and only defaults when unset. Async handler allows awaiting future setup without blocking.
