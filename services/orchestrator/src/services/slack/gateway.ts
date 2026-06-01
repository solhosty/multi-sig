import { routeSlackEvent, type SlackEventPayload } from "./event-router";

type SlackMessage = {
  channelId: string;
  threadTs?: string;
  userId: string;
  text: string;
  threadOwnerUserId?: string;
};

export class SlackGateway {
  constructor(private readonly botUserId: string) {}

  toEventPayload(message: SlackMessage): SlackEventPayload {
    const isBotOwnedThread =
      typeof message.threadTs === "string" && message.threadOwnerUserId === this.botUserId;

    return routeSlackEvent({
      channelId: message.channelId,
      threadTs: message.threadTs,
      userId: message.userId,
      text: message.text,
      isBotOwnedThread,
    });
  }
}
