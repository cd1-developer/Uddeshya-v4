import { getEmployees, Employee } from "@/helper/getEmployees";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const employees = (await getEmployees()) || [];

    const employee = employees.find((emp: Employee) => emp.userId === userId);

    return NextResponse.json({
      success: true,
      data: employee || null,
    });
  } catch (error: any) {
    console.error("Error fetching employee:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching employee",
        error: error?.message,
      },
      { status: 500 }
    );
  }
};
