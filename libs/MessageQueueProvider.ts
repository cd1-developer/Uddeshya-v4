import { Client } from "@upstash/qstash";

export class MessageQueueProvider {
  private static instance: MessageQueueProvider;
  private client: Client;
  constructor() {
    this.client = new Client({
      token: process.env.QSTASH_TOKEN!,
    });
  }

  static getInstance() {
    if (!MessageQueueProvider.instance) {
      MessageQueueProvider.instance = new MessageQueueProvider();
    }
    return MessageQueueProvider.instance;
  }
  async publishJob({ url, payload }: { url: string; payload: any }) {
    await this.client.publishJSON({
      url,
      body: payload,
    });
  }
}
