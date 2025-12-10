import { Redis } from "@upstash/redis";

export class RedisProvider {
  private static instance: RedisProvider;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  static getInstance() {
    if (!RedisProvider.instance) {
      RedisProvider.instance = new RedisProvider();
    }
    return RedisProvider.instance;
  }

  async set<T>(key: string, value: T) {
    await this.client.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.client.get<T>(key);
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
