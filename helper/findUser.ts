import { prisma } from "@/libs/prisma";
// import { RedisProvider } from "@/libs/RedisProvider";
import { User } from "@prisma/client";
/**
 * Checks if a user exists either in Redis cache or the database.
 * Returns an object with a boolean `exists` value.
 */
type UserInfo = Omit<User, "password">;

export const findUser = async (userId: string) => {
  // const redis = await RedisProvider.getInstance();
  // 🔹 Try fetching user from Redis cache
  // let user = await redis.get<UserInfo>(`user:${userId}`);

  // ❌ Cache MISS → Query database instead
  // if (!user) {
  //   console.log("Cache MISS ❌ → Checking user in DB");
  let user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      dateOfBirth: true,
      gender: true,
      createdAt: true,
    },
  });

  // 🔐 Store user into Redis if found in DB
  // if (user) {
  //   console.log("🔐 User found → adding to Redis cache");
  //   await redis.set<UserInfo>(`user:${userId}`, user);
  // }
  // } else {
  //   console.log("Cache HIT ✅ → User found in Redis");
  // }

  // ✔ Determine existence based on query result
  const exists = !!user;
  const email = user?.email;
  const username = user?.username;

  return { exists, email, username };
};
