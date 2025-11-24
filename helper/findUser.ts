import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";

const redis = new RedisProvider();

/**
 * Checks if a user exists either in Redis cache or the database.
 * Returns an object with a boolean `exists` value.
 */
export const findUser = async (userId: string) => {
  // 🔹 Try fetching user from Redis cache
  let user = await redis.get(`user:${userId}`);

  // ❌ Cache MISS → Query database instead
  if (!user) {
    console.log("Cache MISS ❌ → Checking user in DB");
    user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    // 🔐 Store user into Redis if found in DB
    if (user) {
      console.log("🔐 User found → adding to Redis cache");
      await redis.set(`user:${userId}`, user);
    }
  } else {
    console.log("Cache HIT ✅ → User found in Redis");
  }

  // ✔ Determine existence based on query result
  const exists = !!user;

  return { exists };
};
