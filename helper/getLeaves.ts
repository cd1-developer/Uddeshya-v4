import { RedisProvider } from "@/libs/RedisProvider";
import { prisma } from "@/libs/prisma";
import { Leave } from "@prisma/client";

export const getLeaves = async () => {
  const redis = RedisProvider.getInstance();
  try {
    // Try getting leaves from cache first
    let leaves = await redis.getList<Leave>("leaves:list");

    if (leaves) {
      console.log("Cache HIT: Returning leaves from Redis");
      return leaves;
    }

    // Cache MISS → Fetch from DB
    console.log("Cache MISS: Fetching leaves from DB");
    leaves = await prisma.leave.findMany({
      include: {
        applicant: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        actionBy: true,
      },
    });

    // Store fetched data in Redis for future requests
    await redis.setList("leaves:list", leaves);
    console.log("Leaves stored in Redis cache");

    return leaves;
  } catch (error: any) {
    console.error("Error fetching leaves:", error.message || error);
  }
};
