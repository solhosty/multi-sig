import type { SlackEventBase } from "../../../adapters/slack/types";

export type ChannelType = "im" | "channel";

export interface ClientContext {
  channelId: string;
  threadTs?: string;
  metadata: {
    channelType: ChannelType;
  };
}

export function buildSlackClientContext(payload: SlackEventBase): ClientContext {
  return {
    channelId: payload.channelId,
    threadTs: payload.threadTs,
    metadata: {
      channelType: payload.isBotOwnedThread ? "im" : "channel",
    },
  };
}
