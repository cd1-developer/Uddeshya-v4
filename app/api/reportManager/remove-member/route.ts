import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import getEmployeeInfo from "@/helper/getEmployeeInfo";
import { RedisProvider } from "@/libs/RedisProvider";
import { getEmployees } from "@/helper/getEmployees";
import { getLeaves } from "@/helper/getLeaves";
import { Employee, Leave, LeaveStatus } from "@prisma/client";

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
    // If all Wells then update DB and then Udpate the redis Cache
    // Step- 1 : First Update the DB

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

    // Step-2 : Update the Redis Cache
    await updatedEmployeesCache(employeeId, reportManagerId);

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

const updatedEmployeesCache = async (
  employeeId: string,
  reportManagerId: string
) => {
  const redis = await RedisProvider.getInstance();
  const employees = (await getEmployees()) || [];
  const leaves = (await getLeaves()) || [];

  let updatedEmployees = employees.map((emp) =>
    emp.id === reportManagerId
      ? {
          ...emp,
          // Remove the all Pending leaves of the assign members
          leavesApplied: emp.leavesApplied.map((leave: Leave) =>
            leave.actionByEmployeeId === employeeId &&
            leave.LeaveStatus === LeaveStatus.PENDING
              ? { ...leave, actionByEmployeeId: null }
              : leave
          ),
          // Remove the assing member from the reportManager
          assignMembers: emp.assignMembers.filter(
            (member: Employee) => member.id != employeeId
          ),
        }
      : emp
  );
  // remove the reportManager info from the assing member
  updatedEmployees = updatedEmployees.map((emp) =>
    emp.id === employeeId
      ? { ...emp, reportManagerId: null, reportManager: null }
      : emp
  );
  // Remove the reportManager from the assing members applied leaves

  let updatedLeaves = leaves.map((leave) =>
    leave.employeeId === employeeId && leave.LeaveStatus === LeaveStatus.PENDING
      ? { ...leave, actionByEmployeeId: null }
      : leave
  );

  await redis.set("Employees", updatedEmployees);
  await redis.set("leaves", updatedLeaves);
};
