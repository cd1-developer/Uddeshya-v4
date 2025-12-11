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
    await this.client.rpush(key, JSON.stringify(value));
  }

  async del(key: string) {
    if (await this.client.exists(key)) {
      await this.client.del(key);
      return;
    }
    return;
  }
  private pipeline() {
    return this.client.pipeline();
  }
  async llen(key: string) {
    return this.client.llen(key);
  }
  private async lrange(key: string, start: number, end: number) {
    return this.client.lrange(key, start, end);
  }
  async getList<T>(key: string) {
    let items = (await this.client.lrange(key, 0, -1)).map(
      (item) => item
    ) as T[];

    return items;
  }

  async paginator<T>(
    key: string,
    cursor: number,
    limit: number,
    fetcher: () => Promise<T[]>
  ) {
    let total = await this.llen(key);
    if (total === 0) {
      await this.loadData(key, fetcher);
      // Recalculate `total` because the old value (0) was before inserting items.
      // This ensures pagination uses the correct list size and nextCursor calculate properly.
      total = await this.llen(key);
    }
    let start = cursor;
    let end = cursor + limit - 1; // curor is 0 and limit is 20 then return 21 element will return but limit -1  we got 20 only as client asked
    // Fetch only required slice

    const items = await this.lrange(key, start, end);
    let nextCursor = end + 1 < total ? end + 1 : null;
    return {
      success: true,
      data: items,
      nextCursor,
      hasMore: nextCursor !== null,
    };
  }
  private async loadData<T>(key: string, fetcher: () => Promise<T[]>) {
    let cacheData = await fetcher();

    await this.setList(key, cacheData);
  }

  async setList(key: string, value: any[]) {
    await this.del(key); // Delete the preivous data if present
    const pipeline = this.pipeline();
    for (const data of value) {
      pipeline.rpush(key, JSON.stringify(data));
    }
    // Pushing all the data in redis queue
    // pipeline.rpush("key", JSON.stringify(data1));
    // pipeline.rpush("key", JSON.stringify(data2));
    // pipeline.rpush("key", JSON.stringify(data3));
    await pipeline.exec();
  }
  async removeFromListById<T>(key: string, id: string) {
    const list = await this.getList<T & { id: any }>(key);
    const index = list.findIndex((item) => item?.id === id);
    if (index === -1) return false;

    await this.client.lrem(key, 1, JSON.stringify(list[index]));
    return true;
  }

  async updateListById<T>(key: string, index: number, updatedData: T) {
    await this.client.lset(key, index, JSON.stringify(updatedData));
    return true;
  }
}
