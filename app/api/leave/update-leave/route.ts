import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateLeave } from "@/helper/validateLeave";
import { LeaveSchema } from "@/schemas/leave.schema";
import validateData from "@/helper/validateData";
import z from "zod";

const updateLeaveScheama = LeaveSchema.omit({
  employeeId: true,
  actionByEmployeeId: true,
});

export const PATCH = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Leave ID is required" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as any;

    if (body.startDateTime) body.startDateTime = new Date(body.startDateTime);

    if (body.endDateTime) body.endDateTime = new Date(body.endDateTime);

    const { success, message, data } = validateData(updateLeaveScheama, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const {
      success: validLeaveSuccess,
      message: validateLeaveMessage,
      status,
    } = await validateLeave(id);

    if (!validLeaveSuccess) {
      return NextResponse.json(
        { success: false, message: validateLeaveMessage },
        { status }
      );
    }

    const updateData = Object.fromEntries(
      Object.entries(data as z.infer<typeof updateLeaveScheama>).filter(
        ([_, value]) => value !== undefined
      )
    );

    await prisma.leave.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Leave updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating leave:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update leave",
      },
      { status: 500 }
    );
  }
};
