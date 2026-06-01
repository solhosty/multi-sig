import { routeDiscordEvent, type DiscordEventPayload } from "./event-router";

type DiscordTextChannel = {
  id: string;
  isThread: boolean;
  ownerId?: string;
};

type DiscordMessage = {
  guildId?: string;
  authorId: string;
  content: string;
  channel: DiscordTextChannel;
};

export class DiscordGateway {
  constructor(private readonly botUserId: string) {}

  toEventPayload(message: DiscordMessage): DiscordEventPayload {
    const isThread = message.channel.isThread;
    const isBotOwnedThread = isThread && message.channel.ownerId === this.botUserId;

    return routeDiscordEvent({
      guildId: message.guildId,
      channelId: message.channel.id,
      threadId: isThread ? message.channel.id : undefined,
      authorId: message.authorId,
      content: message.content,
      isBotOwnedThread,
    });
  }
}
