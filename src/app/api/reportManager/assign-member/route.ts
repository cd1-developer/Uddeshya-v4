import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import getEmployeeInfo from "../../../../../helper/getEmployeeInfo";

export const POST = async (req: NextRequest) => {
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

    const [isReportManagerExist, isEmployeeExist] = await Promise.all([
      getEmployeeInfo(reportManagerId),
      getEmployeeInfo(employeeId),
    ]);

    if (!isReportManagerExist) {
      return NextResponse.json(
        {
          success: false,
          message: "Report manager not found",
        },
        { status: 404 }
      );
    }

    if (!isEmployeeExist) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        reportManagerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report manager assigned successfully",
    });
  } catch (error: any) {
    console.error("Assign Manager Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign report manager",
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
};
