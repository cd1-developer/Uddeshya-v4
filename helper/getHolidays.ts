import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";
import { Holiday } from "@prisma/client";

export const getHolidays = async () => {
  const redis = RedisProvider.getInstance();

  try {
    // Try reading from Redis cache
    const cached = await redis.getList<Holiday>("holiday:list");

    let holidays: Holiday[] = [];

    // Validate Redis data before using it
    if (cached && Array.isArray(cached)) {
      holidays = cached as Holiday[];
    }

    if (holidays.length > 0) {
      return {
        success: true,
        holidays,
      };
    }

    // Fallback to Prisma DB
    const dbHolidays = await prisma.holiday.findMany();

    return {
      success: true,
      holidays: dbHolidays,
    };
  } catch (error: any) {
    console.error("❌ Error in getHolidays:", {
      message: error?.message,
      stack: error?.stack,
    });

    return {
      success: false,
      message: "Internal error while fetching holidays.",
      error: error?.message ?? "Unknown error",
    };
  }
};
