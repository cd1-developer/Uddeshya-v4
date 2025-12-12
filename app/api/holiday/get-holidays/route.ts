import { NextResponse } from "next/server";
import { getHolidays } from "@//helper/getHolidays";
import { Holiday } from "@prisma/client";

export const GET = async () => {
  try {
    const { success, message, holidays } =
      (await getHolidays()) || ([] as Holiday[]);
    if (!success) {
      return NextResponse.json({
        success,
        message,
      });
    }
    return NextResponse.json({
      success: true,
      holidays,
    });
  } catch (error: any) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch holidays",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
};
