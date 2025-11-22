import { prisma } from "@/libs/prisma";
import validateData from "../../../../../helper/validateData";
import z from "zod";
import { LeaveSchema } from "../../../../../schemas/leave.schema";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = (await req.json()) as any;

  body.startDateTime = new Date(body.startDateTime);
  if (body.endDateTime) {
    body.endDateTime = new Date(body.endDateTime);
  }

  const { success, message, data } = validateData(LeaveSchema, body);

  if (!success) {
    return NextResponse.json({ success, message });
  }
  const validLeaveData = Object.fromEntries(
    Object.entries(data as z.infer<typeof LeaveSchema>).filter(
      ([_, value]) => value !== undefined
    )
  );
  const { employeeId } = validLeaveData as z.infer<typeof LeaveSchema>;

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId },
  });
  if (!employee) {
    return NextResponse.json(
      { success: false, message: "Employee not found" },
      { status: 404 }
    );
  }

  const newAppliedLeave = await prisma.leave.create({
    data: { ...validLeaveData },
  });
};
