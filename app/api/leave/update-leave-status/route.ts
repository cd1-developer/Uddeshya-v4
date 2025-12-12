import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";
import validateData from "@/helper/validateData";
import z from "zod";
import { EmployeeLeaveBalance, Leave, LeaveStatus } from "@prisma/client";
import { RedisProvider } from "@/libs/RedisProvider";
import { getLeaves } from "@/helper/getLeaves";

import { getEmployees, type Employee } from "@/helper/getEmployees";
import { findWithIndex } from "@/helper/findWithIndex";

/**
 * Zod schema for validating the request body when updating a leave status.
 */
const UpdateLeaveSchema = z.object({
  leaveId: z.string({ error: "Leave is required" }),
  employeeId: z.string({ error: "Organisation member is required" }),
  updatedStatus: z.enum(LeaveStatus, {
    error: "Updated Status is can be Approved or Rejected",
  }),
  policyName: z.string({ error: "Policy Name is required" }),
  deductedBalance: z.number({ error: "Updated Leave Balance is required" }),
  rejectReason: z.string().optional(),
});

/**
 * Updates the employee's total leave balance in the database after a leave is approved.
 * @param employeeId - The ID of the employee.
 * @param deductedBalance - The number of leave days to deduct.
 * @param policyName - The name of the leave policy to update the balance for.
 * @returns An object indicating success or failure.
 */
const updateTotalBalance = async (
  employeeId: string,
  deductedBalance: number,
  policyName: string
) => {
  try {
    const totalBalance = await prisma.employeeLeaveBalance.findFirst({
      where: {
        employeeId,
        policyName,
      },
    });

    if (!totalBalance) {
      // This case should ideally not happen if data is consistent.
      console.error(
        `Leave balance not found for employee ${employeeId} and policy ${policyName}`
      );
      return {
        success: false,
        message: "Total leave balance record not found",
      };
    }

    await prisma.employeeLeaveBalance.update({
      where: {
        id: totalBalance.id,
      },
      data: {
        balance: {
          decrement: deductedBalance,
        },
      },
    });

    return { success: true, message: "Balance updated successfully" };
  } catch (error) {
    console.error("Failed to update total balance in DB:", error);
    return {
      success: false,
      message: "Database error while updating leave balance.",
    };
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // 1. Parse and validate the request body.
    const body = await req.json();

    const {
      success: validationSuccess,
      data,
      message: ValidationMessage,
    } = validateData(UpdateLeaveSchema, body);

    if (!validationSuccess) {
      return NextResponse.json({
        success: false,
        message: ValidationMessage,
      });
    }

    const {
      leaveId,
      employeeId,
      deductedBalance,
      updatedStatus,
      policyName,
      rejectReason,
    } = data as z.infer<typeof UpdateLeaveSchema>;

    // 2. Fetch required data from cache/DB.
    const employees = (await getEmployees()) || [];
    const employee = employees.find((employee) => employee.id === employeeId);
    const leaves = (await getLeaves()) || [];

    const leave = leaves.find((leave) => leave.id === leaveId);

    if (!employee || !leave) {
      return NextResponse.json({
        success: false,
        message: "Organisation member not found or leave not found",
      });
    }

    // 3. Update the leave status in the database.
    await prisma.leave.update({
      where: {
        id: leaveId,
      },
      data: {
        LeaveStatus: updatedStatus,
        ...(updatedStatus === LeaveStatus.REJECTED && {
          rejectReason: rejectReason,
        }),
      },
    });
    console.log(`Leave ${leaveId} status updated to ${updatedStatus} in DB.`);

    if (
      updatedStatus === LeaveStatus.APPROVED &&
      leave.policyName !== "Exam Leave" &&
      leave.policyName !== "Exam Leave"
    ) {
      // 4. If approved, deduct the balance from the employee's total leave balance.
      const { success, message } = await updateTotalBalance(
        employeeId,
        deductedBalance,
        policyName
      );

      // If the database update for balance fails, return an error.
      if (!success) {
        // Note: At this point, the leave status is updated, but balance deduction failed.
        // This might require a manual correction or a more complex rollback mechanism.
        return NextResponse.json({ success, message }, { status: 500 });
      }
    }

    // 5. Update the Redis cache to reflect the changes.
    await updateRedisCache({
      employeeId,
      leaveId,
      leaveStatus: updatedStatus,
      deductedBalance,
      policyName,
      rejectReason,
      leaves,
      employees,
    });

    return NextResponse.json({
      success: true,
      message:
        updatedStatus === LeaveStatus.APPROVED
          ? "Leave Approved Successfully"
          : "Leave Rejected Successfully",
    });
  } catch (error: any) {
    console.error("Update Leave API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong!",
      error: error,
    });
  }
};
type updateRedisCacheType = {
  employeeId: string;
  leaveId: string;
  leaveStatus: LeaveStatus;
  deductedBalance?: number;
  policyName: string;
  rejectReason?: string;
  leaves: Leave[];
  employees: Employee[];
};
/**
 * Updates Redis cache after a leave request status changes.
 * This ensures API reads remain fast and consistent with the DB state.
 *
 * Redis holds:
 *  - leaves:list → list of all leave records
 *  - employees:list → list of employees with nested leave data
 *
 * @param employeeId - ID of the employee whose data is updated
 * @param leaveId - ID of the leave that was modified
 * @param leaveStatus - New status (Approved/Rejected)
 * @param deductedBalance - Balance deduction (only for approved leaves)
 * @param policyName - Policy under which balance was updated
 */
const updateRedisCache = async ({
  employeeId,
  leaveId,
  leaveStatus,
  deductedBalance,
  policyName,
  rejectReason,
  leaves,
  employees,
}: updateRedisCacheType) => {
  try {
    const redis = RedisProvider.getInstance();

    // Find employee + leave inside the cached arrays
    const { value: leave, index: leaveIndex } = findWithIndex(leaves, leaveId);
    const { value: employee, index: employeeIndex } = findWithIndex(
      employees,
      employeeId
    );
    const { value: reportManager, index: reportManagerIndex } = findWithIndex(
      employees,
      (employee as Employee).reportManagerId as string
    );

    // Updated leave object for cache
    const updatedLeave: Leave = {
      ...leave,
      LeaveStatus: leaveStatus,
      ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
    };

    // Updated employee object with:
    //  - updated leave status inside leavesApplied[]
    //  - updated balance (only if approved)
    const updatedEmployee: Employee = {
      ...employee,
      leavesApplied: employee.leavesApplied.map((lv: Leave) =>
        lv.id === leaveId
          ? {
              ...lv,
              LeaveStatus: leaveStatus,
              ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
            }
          : lv
      ),
      ...(leaveStatus === LeaveStatus.APPROVED && {
        leaveBalances: employee.leaveBalances.map(
          (balance: EmployeeLeaveBalance) =>
            balance.policyName === policyName
              ? {
                  ...balance,
                  balance:
                    (balance.balance as number) - (deductedBalance as number),
                }
              : balance
        ),
      }),
    };
    // update the ReportManager leave Actioned
    const updatedReportManager: Employee = {
      ...reportManager,
      leavesActioned: reportManager.leavesActioned.map((leave: Leave) =>
        leave.id === leaveId
          ? {
              ...leave,
              LeaveStatus: leaveStatus,
              ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
            }
          : leave
      ),
    };

    // Update Redis lists at specific index positions
    await redis.updateListById("leaves:list", leaveIndex, updatedLeave);
    await redis.updateListById(
      "employees:list",
      employeeIndex,
      updatedEmployee
    );
    await redis.updateListById(
      "employees:list",
      reportManagerIndex,
      updatedReportManager
    );

    console.log("Redis cache updated for leave + employee record");
  } catch (error) {
    // Cache failures should not block main workflow.
    console.error("Redis cache update failed:", error);
  }
};
