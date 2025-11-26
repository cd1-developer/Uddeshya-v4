import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";

const redis = new RedisProvider();

export const getHolidays = async () => {
  try {
    const holidays =
      (await redis.get("holidays")) || (await prisma.holiday.findMany({}));
    return {
      success: true,
      holidays,
    };
  } catch (error: any) {
    console.error("Error fetching holidays:", error);
    return {
      success: false,
      message: "Failed to fetch holidays",
    };
  }
};
