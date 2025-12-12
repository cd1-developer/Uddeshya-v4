import { NextRequest, NextResponse } from "next/server";
import { Employee, getEmployees } from "@/helper/getEmployees";
import { RedisProvider } from "@/libs/RedisProvider";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  let cursor = Number(params.cursor) || 0;
  let limit = Number(params.limit) || 20;

  try {
    const redis = RedisProvider.getInstance();
    const { success, data, nextCursor, hasMore } =
      await redis.paginator<Employee>(
        "employees:list",
        cursor,
        limit,
        getEmployees
      );

    // Send response to client
    return NextResponse.json(
      { success, data, nextCursor, hasMore },
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
