import { Role } from "@/interfaces";
import validateData from "../../../../../helper/validateData";
import { prisma } from "@/libs/prisma";
import { findUser } from "../../../../../helper/findUser";
import { NextRequest, NextResponse } from "next/server";
import { RedisProvider } from "@/libs/RedisProvider";
import z from "zod";
import { Employee } from "@prisma/client";

const addEmployeeSchema = z.object({
  userId: z.string({ error: "userId is required" }),
  role: z.enum(Role, {
    error: "Role can be ADMIN , SUB_ADMIN , MEMBER or REPORT_MANAGER",
  }),
  joiningDate: z.date({ error: "joiningDate should be of date format." }),
  probationEnd: z.date({ error: "Probation period should be of date format." }),
  status: z.enum(["Active", "Probation"], {
    error: "Status can be Active or Probation ",
  }),
});

export const POST = async (req: NextRequest) => {
  const redis = await RedisProvider.getInstance();
  try {
    const body = (await req.json()) as any;
    body.joiningDate = new Date(body.joiningDate);
    body.probationEnd = new Date(body.probationEnd);

    const { success, message, data } = validateData(addEmployeeSchema, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const { userId, role, joiningDate, probationEnd, status } = data as z.infer<
      typeof addEmployeeSchema
    >;

    const { exists } = await findUser(userId);
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const newEmployee = await prisma.employee.create({
      data: {
        userId,
        role,
        joiningDate,
        probationEnd,
        status,
      },
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

    await redis.addToList<Employee>("Employees", newEmployee);

    return NextResponse.json(
      { success: true, data: newEmployee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add Employee Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
