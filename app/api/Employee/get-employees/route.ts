import { NextResponse } from "next/server";
import { getEmployees } from "@/helper/getEmployees";

export const GET = async () => {
  try {
    const allEmployee = await getEmployees();

    // Send response to client
    return NextResponse.json(
      { success: true, data: allEmployee },
      { status: 200 }
    );
  } catch (error: any) {
    // Log and return a user-friendly error response if something breaks
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch employee data",
      },
      { status: 500 }
    );
  }
};
