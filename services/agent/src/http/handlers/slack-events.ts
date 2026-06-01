import type { SlackEventBase } from "../../adapters/slack/types";
import { buildSlackClientContext, type ClientContext } from "../../llm/orchestration/adapters/slack";

export interface SlackEventPayload extends SlackEventBase {
  platform: "slack";
}

export function handleSlackEventWithOrchestration(payload: SlackEventPayload): ClientContext {
  return buildSlackClientContext({
    channelId: payload.channelId,
    threadTs: payload.threadTs,
    userId: payload.userId,
    text: payload.text,
    isBotOwnedThread: payload.isBotOwnedThread,
  });
}
