import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import validateData from "@//helper/validateData";
import z from "zod";
import { RedisProvider } from "@/libs/RedisProvider";
const HolidaySchema = z.object({
  holidayName: z.string({ error: "Holiday name is required" }),
  holidayDate: z.date({ error: "Holiday date is required" }),
});

export const POST = async (req: NextRequest) => {
  const redis = await RedisProvider.getInstance();
  try {
    const body = (await req.json()) as z.infer<typeof HolidaySchema>;
    body.holidayDate = new Date(body.holidayDate);

    const { success, message, data } = validateData(HolidaySchema, body);

    if (!success) {
      return NextResponse.json({ success, message });
    }

    const { holidayDate, holidayName } = data as z.infer<typeof HolidaySchema>;

    const newHoliday = await prisma.holiday.create({
      data: {
        holidayDate,
        holidayName,
      },
    });

    await redis.addToList("holidays", newHoliday);

    return NextResponse.json({
      success: true,
      data: newHoliday,
      message: "Holiday added successfully",
    });
  } catch (error: any) {
    console.error("Error adding holiday:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add holiday",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
};
