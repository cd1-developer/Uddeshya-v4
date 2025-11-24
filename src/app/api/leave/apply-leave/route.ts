import { prisma } from "@/libs/prisma";
import validateData from "../../../../../helper/validateData";
import z from "zod";
import { LeaveSchema } from "../../../../../schemas/leave.schema";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as any;

    // Convert dates before validation
    body.startDateTime = new Date(body.startDateTime);
    if (body.endDateTime) {
      body.endDateTime = new Date(body.endDateTime);
    }

    const { success, message, data } = validateData(LeaveSchema, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const validLeaveData = Object.fromEntries(
      Object.entries(data as z.infer<typeof LeaveSchema>).filter(
        ([_, value]) => value !== undefined
      )
    ) as z.infer<typeof LeaveSchema>;

    const {
      employeeId,
      policyName,
      startDateTime,
      startAbsentType,
      endDateTime,
      endAbsentType,
      reason,
      actionByEmployeeId,
    } = validLeaveData;

    // Check if employee exists
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    const appliedLeaveData = {
      employeeId,
      policyName,
      startDateTime,
      startAbsentType,
      ...(endDateTime && { endDateTime }),
      ...(endAbsentType && { endAbsentType }),
      reason,
      actionByEmployeeId,
    };

    const newAppliedLeave = await prisma.leave.create({
      data: appliedLeaveData,
    });

    return NextResponse.json(
      {
        success: true,
        data: newAppliedLeave,
        message: "Leave applied successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error applying leave:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to apply leave",
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
};
