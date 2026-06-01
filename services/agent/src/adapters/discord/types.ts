export interface DiscordEventBase {
  guildId?: string;
  channelId: string;
  threadId?: string;
  authorId: string;
  content: string;
  isBotOwnedThread?: boolean;
}
