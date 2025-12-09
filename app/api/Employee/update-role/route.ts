import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import getEmployeeInfo from "@//helper/getEmployeeInfo";
import validateData from "@//helper/validateData";
import { getEmployees } from "@//helper/getEmployees";
import { getLeaves } from "@//helper/getLeaves";
import { RedisProvider } from "@/libs/RedisProvider";
import { Employee } from "@/helper/getEmployees";

const RoleSchema = z.object({
  role: z.enum(Role, {
    error: "Role can be Admin , Sub-Admin , Report-Manager or Member required",
  }),
});

export const PATCH = async (req: NextRequest) => {
  const redis = await RedisProvider.getInstance();
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

    // Perform database updates in a transaction
    await prisma.$transaction(async (tx: any) => {
      // If changing from REPORT_MANAGER to another role
      if (
        employee.role === Role.REPORT_MANAGER &&
        role !== Role.REPORT_MANAGER
      ) {
        // Unassign all members reporting to this manager
        await tx.employee.updateMany({
          where: {
            reportManagerId: employeeId,
          },
          data: {
            reportManagerId: null,
          },
        });

        // Unassign manager from all pending leaves
        await tx.leave.updateMany({
          where: {
            actionByEmployeeId: employeeId,
            LeaveStatus: "PENDING",
          },
          data: {
            actionByEmployeeId: null,
          },
        });
      }

      // Update employee role
      await tx.employee.update({
        where: { id: employeeId },
        data: { role },
      });
    });

    // Update Redis cache after successful DB transaction
    try {
      await updateRedisCache(employee as Employee, role);
    } catch (error: any) {
      console.error("Cache update failed:", error.message);

      // Log the error but don't fail the request since DB is already updated
      // delete the entire redis cache
      try {
        await redis.del("Employees");
        await redis.del("leaves");
      } catch (deletionError) {
        console.error("Cache deletion failed:", deletionError);
      }
    }

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

const updateRedisCache = async (employee: Employee, role: Role) => {
  const employees = (await getEmployees()) || [];
  const leaves = (await getLeaves()) || [];
  const redis = await RedisProvider.getInstance();

  let updatedEmployees = employees;
  let updatedLeaves = leaves;
  // If the current Role of employee is reportManager and the new Role of employee is not ReportManager then remove
  // all the assign members to the reportManager and Also unassign the leaves which are pending and which are  applied by
  // assign members
  if (employee.role === Role.REPORT_MANAGER && role !== Role.REPORT_MANAGER) {
    // Remove the reportManager from the assign members
    updatedEmployees = updatedEmployees.map((emp) =>
      emp.reportManagerId === employee.id
        ? { ...emp, reportManagerId: null, reportManager: null }
        : emp
    );
    // Remove the assignMembers and assignLeaves from the reportManager
    updatedEmployees = updatedEmployees.map((emp) =>
      emp.id === employee.id
        ? { ...emp, assignMembers: [], leavesApplied: [] }
        : emp
    );
    // Remove the reportManagerID from assignLeaves from the reportManager
    updatedLeaves = updatedLeaves.map((leave) =>
      leave.actionByEmployeeId === employee.id &&
      leave.LeaveStatus === "PENDING"
        ? { ...leave, actionByEmployeeId: null }
        : leave
    );

    await redis.set("leaves", updatedLeaves);
  }
  // update the role of the Employee
  updatedEmployees = updatedEmployees.map((emp) =>
    emp.id === employee.id ? { ...emp, role } : emp
  );
  await redis.set("Employees", updatedEmployees);
  return;
};
