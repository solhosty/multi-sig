export interface SlackEventPayload {
  platform: "slack";
  channelId: string;
  threadTs?: string;
  userId: string;
  text: string;
  isBotOwnedThread?: boolean;
}

export interface SlackEventInput {
  channelId: string;
  threadTs?: string;
  userId: string;
  text: string;
  isBotOwnedThread?: boolean;
}

export function routeSlackEvent(input: SlackEventInput): SlackEventPayload {
  return {
    platform: "slack",
    ...input,
  };
}
