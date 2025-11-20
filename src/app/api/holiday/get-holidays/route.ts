import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const holidays = await prisma.holiday.findMany({});
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
