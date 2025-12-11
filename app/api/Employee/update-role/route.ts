import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Leave, LeaveStatus, Role } from "@prisma/client";
import getEmployeeInfo from "@//helper/getEmployeeInfo";
import validateData from "@//helper/validateData";
import { getEmployees } from "@//helper/getEmployees";
import { getLeaves } from "@//helper/getLeaves";
import { RedisProvider } from "@/libs/RedisProvider";
import { Employee } from "@/helper/getEmployees";
import { findWithIndex } from "@/helper/findWithIndex";
import { assign } from "nodemailer/lib/shared";
import { report } from "process";

const RoleSchema = z.object({
  role: z.enum(Role, {
    error: "Role can be Admin , Sub-Admin , Report-Manager or Member required",
  }),
});

export const PATCH = async (req: NextRequest) => {
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

/**
 * Updates Redis cache when an employee's role changes.
 *
 * Special Case:
 * If an employee is downgraded from REPORT_MANAGER → normal role,
 * then:
 *   1. All employees assigned under this manager must be unassigned.
 *   2. All pending leaves assigned to this manager must be cleared.
 *   3. The manager's own cached data (assignMembers, leavesApplied) must be reset.
 *
 * This ensures cache consistency with DB state and prevents stale references.
 */
const updateRedisCache = async (employee: Employee, role: Role) => {
  const employees = (await getEmployees()) || [];
  const leaves = (await getLeaves()) || [];
  const redis = RedisProvider.getInstance();

  // Locate the employee's index inside the cached employees list
  const { index: employeeIndex } = findWithIndex(employees, employee.id);

  /**
   * Build updated employee object:
   * - Always update the 'role'.
   * - If the employee was a REPORT_MANAGER but is no longer one,
   *   then clear:
   *     - assigned member list
   *     - leaves applied list
   */
  let updatedEmployee = {
    ...employee,
    role,
    ...(employee.role === Role.REPORT_MANAGER &&
      role !== Role.REPORT_MANAGER && {
        assignMembers: [],
        leavesApplied: [],
      }),
  };

  /**
   * If the employee is being downgraded from REPORT_MANAGER → non-manager role:
   * We must:
   *    1. Unassign all employees who currently have this manager.
   *    2. Remove this manager from pending leaves they were responsible for.
   */
  if (employee.role === Role.REPORT_MANAGER && role !== Role.REPORT_MANAGER) {
    // ---------------------------------------------
    // STEP 1: Unassign all employees linked to this manager
    // ---------------------------------------------
    await Promise.all(
      employees.map(async (emp: Employee, index) => {
        if (emp.reportManagerId === employee.id) {
          const updatedAssignMembers = {
            ...emp,
            reportManagerId: null,
            reportManager: null,
          };

          // Return Redis write promise so Promise.all can wait for it
          return redis.updateListById(
            "employees:list",
            index,
            updatedAssignMembers
          );
        }
      })
    );

    // ---------------------------------------------
    // STEP 2: Remove manager assignment from all pending leaves
    // ---------------------------------------------
    await Promise.all(
      leaves.map(async (leave: Leave, index) => {
        if (
          leave.actionByEmployeeId === employee.id &&
          leave.LeaveStatus === LeaveStatus.PENDING // ensure case consistency
        ) {
          const updatedLeave = {
            ...leave,
            actionByEmployeeId: null,
          };

          // Return Redis write promise
          return redis.updateListById("leaves:list", index, updatedLeave);
        }
      })
    );
  }

  // ---------------------------------------------
  // STEP 3: Update the manager's own record in Redis
  // ---------------------------------------------
  await redis.updateListById("employees:list", employeeIndex, updatedEmployee);
};
