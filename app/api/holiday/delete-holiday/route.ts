import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RedisProvider } from "@/libs/RedisProvider";
import { Holiday } from "@/interfaces";

export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Holiday ID is required" },
        { status: 400 }
      );
    }

    await prisma.holiday.delete({
      where: {
        id,
      },
    });

    await updateHolidayCache(id);

    return NextResponse.json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting holiday:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete holiday",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
};

const updateHolidayCache = async (holidayId: string) => {
  const redis = await RedisProvider.getInstance();

  const holidays = (await redis.get<Holiday[]>("holidays")) || [];

  const updatedHolidays = holidays.filter(
    (holiday) => holiday.id !== holidayId
  );

  await redis.set("holidays", updatedHolidays);
};
