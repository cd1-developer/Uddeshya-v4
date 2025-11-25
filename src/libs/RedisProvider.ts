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
    } else {
      console.log("Redis is already connected");
    }
  }
  async set<T>(key: string, value: T) {
    await this.client.set(key, JSON.stringify(value));
  }
  async get<T>(key: string): Promise<T | null> {
    let value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
  async addToList<T>(key: string, value: T) {
    let list = (await this.get<T[]>(key)) || [];

    list.push(value);
    await this.set(key, list);
  }
  async del(key: string) {
    await this.client.del(key);
  }
}
