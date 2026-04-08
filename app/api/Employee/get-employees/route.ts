import { NextRequest, NextResponse } from "next/server";
import { INCLUDES_EMPLOYEES } from "@/helper/getEmployees";
// import { RedisProvider } from "@/libs/RedisProvider";
import { prisma } from "@/libs/prisma";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  let cursor = Number(params.cursor) || 0;
  let limit = Number(params.limit) || 20;

  try {
    // const redis = RedisProvider.getInstance();
    let employees = await prisma.employee.findMany({
      skip: cursor,
      take: limit,
      include: INCLUDES_EMPLOYEES,
    });

    // Send response to client
    return NextResponse.json(
      {
        success: true,
        data: employees,
        nextCursor: cursor + limit,
        hasMore: employees.length !== 0,
      },
      { status: 200 },
    );
  } catch (error: any) {
    // Log and return a user-friendly error response if something breaks
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch employee data",
      },
      { status: 500 },
    );
  }
};
