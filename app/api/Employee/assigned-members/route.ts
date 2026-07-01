import { getEmployees, Employee } from "@/helper/getEmployees";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    // Full employee set (includes leaveBalances, leavesApplied, user, etc.)
    const employees = (await getEmployees()) || [];

    const currentEmployee = employees.find(
      (emp: Employee) => emp.userId === userId,
    );

    if (!currentEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 },
      );
    }

    // ADMIN        → members with no report manager (implicitly assigned to admin)
    // REPORT_MANAGER → members whose reportManagerId matches this manager
    const assignMembers =
      currentEmployee.role === Role.ADMIN
        ? employees.filter((emp: Employee) => !emp.reportManagerId)
        : employees.filter(
            (emp: Employee) => emp.reportManagerId === currentEmployee.id,
          );

    return NextResponse.json({
      success: true,
      data: {
        role: currentEmployee.role,
        employeeId: currentEmployee.id,
        assignMembers,
      },
    });
  } catch (error: any) {
    console.error("Error fetching assigned members:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching assigned members",
        error: error?.message,
      },
      { status: 500 },
    );
  }
};
