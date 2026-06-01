export interface SlackEventBase {
  channelId: string;
  threadTs?: string;
  userId: string;
  text: string;
  isBotOwnedThread?: boolean;
}
