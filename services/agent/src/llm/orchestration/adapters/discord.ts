import type { DiscordEventBase } from "../../../adapters/discord/types";

export type ChannelType = "im" | "channel";

export interface ClientContext {
  channelId: string;
  threadId?: string;
  metadata: {
    channelType: ChannelType;
  };
}

export function buildDiscordClientContext(payload: DiscordEventBase): ClientContext {
  return {
    channelId: payload.channelId,
    threadId: payload.threadId,
    metadata: {
      channelType: payload.isBotOwnedThread ? "im" : "channel",
    },
  };
}
