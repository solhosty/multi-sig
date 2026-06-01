import type { DiscordEventBase } from "../../adapters/discord/types";
import { buildDiscordClientContext, type ClientContext } from "../../llm/orchestration/adapters/discord";

export interface DiscordEventPayload extends DiscordEventBase {
  platform: "discord";
}

export function handleDiscordEventWithOrchestration(payload: DiscordEventPayload): ClientContext {
  return buildDiscordClientContext({
    guildId: payload.guildId,
    channelId: payload.channelId,
    threadId: payload.threadId,
    authorId: payload.authorId,
    content: payload.content,
    isBotOwnedThread: payload.isBotOwnedThread,
  });
}
