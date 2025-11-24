import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import getEmployeeInfo from "../../../../../helper/getEmployeeInfo";

export const DELETE = async (req: NextRequest) => {
  try {
    const { reportManagerId, employeeId } = (await req.json()) as {
      reportManagerId: string;
      employeeId: string;
    };

    if (!reportManagerId || !employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Report manager ID and employee ID are required",
        },
        { status: 400 }
      );
    }

    const [reportManager, employee] = await Promise.all([
      getEmployeeInfo(reportManagerId),
      getEmployeeInfo(employeeId),
    ]);

    if (!reportManager) {
      return NextResponse.json(
        {
          success: false,
          message: "Report manager not found",
        },
        { status: 404 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Unassign report manager from this employee
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        reportManagerId: null,
      },
    });

    // Also unassign same manager from all existing applied leaves
    if (employee.leavesApplied.length > 0) {
      await prisma.leave.updateMany({
        where: {
          employeeId: employeeId,
        },
        data: {
          actionByEmployeeId: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Report manager unassigned successfully",
    });
  } catch (error: any) {
    console.error("Error unassigning report manager:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to unassign report manager",
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
};
