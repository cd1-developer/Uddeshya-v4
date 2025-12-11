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
  const redis = RedisProvider.getInstance();
  const employees = (await getEmployees()) || [];
  const leaves = (await getLeaves()) || [];

  await Promise.all(
    employees.map(async (emp, index) => {
      if (emp.id === reportManagerId) {
        const updatedReportManager = {
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
        };
        return redis.updateListById(
          "employees:list",
          index,
          updatedReportManager
        );
      }
      // remove the reportManager info from the assing member
      if (emp.id === employeeId) {
        const updatedEmployee = {
          ...emp,
          reportManagerId: null,
          reportManager: null,
        };
        return redis.updateListById("employees:list", index, updatedEmployee);
      }
    })
  );

  // Remove the reportManager from the assing members applied leaves

  await Promise.all(
    leaves.map(async (leave, index) => {
      if (
        leave.employeeId === employeeId &&
        leave.LeaveStatus === LeaveStatus.PENDING
      ) {
        const updatedLeave = {
          ...leave,
          actionByEmployeeId: null,
        };
        return redis.updateListById("leaves:list", index, updatedLeave);
      }
    })
  );
};
