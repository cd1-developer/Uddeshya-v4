import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import getEmployeeInfo from "../../../../../helper/getEmployeeInfo";
import validateData from "../../../../../helper/validateData";

const RoleSchema = z.object({
  role: z.enum(Role, {
    error: "Role can be Admin , Sub-Admin , Report-Manager or Member required",
  }),
});

export const PACTH = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const params = Object.fromEntries(searchParams.entries());

    const { employeeId } = params;

    if (!employeeId) {
      return NextResponse.json({
        success: false,
        message: "Employee Id is required",
      });
    }
    const body = (await req.json()) as z.infer<typeof RoleSchema>;
    const { success, message, data } = validateData(RoleSchema, body);

    if (!success) {
      return NextResponse.json({ success, message });
    }

    const employee = await getEmployeeInfo(employeeId);

    if (!employee) {
      return NextResponse.json({
        success: false,
        message: "Employee not found",
      });
    }
    const { role } = data as z.infer<typeof RoleSchema>;

    // If admin pass the same role of the Employee which was previous the then return false and
    // tell the ADMIN please pass differnent role

    if (employee.role === role) {
      return NextResponse.json({
        success: false,
        message: "Please pass different role",
      });
    }

    // If employee role is Report manager then and ADMIN change the role of
    // Employee from ReportManager to some other role then first unassign all the assign-memebers and
    // also unassign same manager from all existing applied leaves
    if (employee.role === "REPORT_MANAGER" && role !== "REPORT_MANAGER") {
      await prisma.employee.updateMany({
        where: {
          reportManagerId: employeeId,
        },
        data: {
          reportManagerId: null,
        },
      });

      await prisma.leave.updateMany({
        where: {
          actionByEmployeeId: employeeId,
        },
        data: {
          actionByEmployeeId: null,
        },
      });
    }
    await prisma.employee.update({
      where: { id: employeeId },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/employee/update-role error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
