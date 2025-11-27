import { RedisProvider } from "@/libs/RedisProvider";
import { prisma } from "@/libs/prisma";
import { Leave } from "@prisma/client";

export const getLeaves = async () => {
  const redis = await RedisProvider.getInstance();
  try {
    // Try getting leaves from cache first
    let leaves = await redis.get<Leave[]>("leaves");

    if (leaves) {
      console.log("Cache HIT: Returning leaves from Redis");
      return leaves;
    }

    // Cache MISS → Fetch from DB
    console.log("Cache MISS: Fetching leaves from DB");
    leaves = await prisma.leave.findMany({
      include: {
        applicant: true,
        actionBy: true,
      },
    });

    // Store fetched data in Redis for future requests
    await redis.set("leaves", leaves);
    console.log("Leaves stored in Redis cache");

    return leaves;
  } catch (error: any) {
    console.error("Error fetching leaves:", error.message || error);

    // Fallback: attempt DB fetch even if Redis fails
    try {
      return await prisma.leave.findMany({
        include: {
          applicant: true,
          actionBy: true,
        },
      });
    } catch (dbError: any) {
      console.error("DB fetch also failed:", dbError);
      return null;
    }
  }
};
