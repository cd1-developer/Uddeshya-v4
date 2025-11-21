import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import validateData from "../../../../../helper/validateData";

const HolidaySchema = z.object({
  holidayName: z
    .string({ error: "Holiday name should be string format" })
    .optional(),

  // Accepts string and converts to Date
  holidayDate: z
    .string({ error: "Holiday date should be in string format" })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { searchParams } = new URL(req.url);
    const { id } = Object.fromEntries(searchParams.entries());

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Holiday ID is required" },
        { status: 400 }
      );
    }

    // Validate and get clean data
    const { success, message, data } = validateData(HolidaySchema, body);
    const validData = Object.fromEntries(
      Object.entries(data as z.infer<typeof HolidaySchema>).filter(
        ([_, value]) => value !== undefined
      )
    );

    if (!success) {
      return NextResponse.json({ success, message });
    }

    const updatedHoliday = await prisma.holiday.update({
      where: { id },
      data: validData,
    });

    return NextResponse.json({
      success: true,
      data: updatedHoliday,
      message: "Holiday updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update holiday",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
