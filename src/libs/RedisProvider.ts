import { createClient } from "redis";

export class RedisProvider {
  client;
  constructor() {
    this.client = createClient();
    this.client.on("error", (error) =>
      console.error(`Redis Client error: ${error}`)
    );
    this.init();
  }
  async init() {
    if (!this.client.isReady) {
      console.log("Connecting to Redis...");
      await this.client.connect();
      console.log("Redis connected successfully!");
    }
    console.log("Redis is already connected");
  }
  async set(key: string, value: any) {
    await this.client.set(key, JSON.stringify(value));
  }
  async get(key: string) {
    let value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
}
