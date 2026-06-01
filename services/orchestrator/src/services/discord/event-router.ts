export interface DiscordEventPayload {
  platform: "discord";
  guildId?: string;
  channelId: string;
  threadId?: string;
  authorId: string;
  content: string;
  isBotOwnedThread?: boolean;
}

export interface DiscordEventInput {
  guildId?: string;
  channelId: string;
  threadId?: string;
  authorId: string;
  content: string;
  isBotOwnedThread?: boolean;
}

export function routeDiscordEvent(input: DiscordEventInput): DiscordEventPayload {
  return {
    platform: "discord",
    ...input,
  };
}
