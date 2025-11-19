import { prisma } from "../../../../../libs/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const allEmployee = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        reportManager: true,
        assignMembers: true,
        leaveBalances: true,
        EmployeeLatestIncrement: true,
        leavesApplied: true,
        leavesActioned: true,
      },
    });

    return NextResponse.json(
      { success: true, data: allEmployee },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch employees",
      },
      { status: 500 }
    );
  }
};
