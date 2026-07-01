import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";
import validateData from "@/helper/validateData";
import z from "zod";
import { EmployeeLeaveBalance, Leave, LeaveStatus } from "@prisma/client";
// import { RedisProvider } from "@/libs/RedisProvider";
import { getLeaves } from "@/helper/getLeaves";

import { getEmployees, type Employee } from "@/helper/getEmployees";
import { findWithIndex } from "@/helper/findWithIndex";
import POLICIES from "@/constant/Policies";

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

    // 3. Decide whether this approval should deduct from a leave balance.
    // Zero-accrual policies (e.g. Exam Leave, Un-Paid Leave) have no
    // EmployeeLeaveBalance record, so they must never be deducted.
    const isDeductible =
      POLICIES.find((p) => p.policyName === leave.policyName)?.accural !== 0;

    const shouldDeduct = updatedStatus === LeaveStatus.APPROVED && isDeductible;

    // If we need to deduct, make sure the balance record exists first so we
    // can fail cleanly instead of leaving the leave approved with no deduction.
    let balanceRecordId: string | null = null;
    if (shouldDeduct) {
      const totalBalance = await prisma.employeeLeaveBalance.findFirst({
        where: { employeeId, policyName },
      });

      if (!totalBalance) {
        console.error(
          `Leave balance not found for employee ${employeeId} and policy ${policyName}`,
        );
        return NextResponse.json(
          { success: false, message: "Total leave balance record not found" },
          { status: 500 },
        );
      }

      balanceRecordId = totalBalance.id;
    }

    // 4. Update the leave status and (if applicable) deduct the balance
    // atomically, so we never end up with one applied without the other.
    await prisma.$transaction([
      prisma.leave.update({
        where: { id: leaveId },
        data: {
          LeaveStatus: updatedStatus,
          ...(updatedStatus === LeaveStatus.REJECTED && {
            rejectReason: rejectReason,
          }),
        },
      }),
      ...(shouldDeduct && balanceRecordId
        ? [
            prisma.employeeLeaveBalance.update({
              where: { id: balanceRecordId },
              data: { balance: { decrement: deductedBalance } },
            }),
          ]
        : []),
    ]);
    console.log(`Leave ${leaveId} status updated to ${updatedStatus} in DB.`);

    // 5. Update the Redis cache to reflect the changes.
    // await updateRedisCache({
    //   employeeId,
    //   leaveId,
    //   leaveStatus: updatedStatus,
    //   deductedBalance,
    //   policyName,
    //   rejectReason,
    //   leaves,
    //   employees,
    // });

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
// const updateRedisCache = async ({
//   employeeId,
//   leaveId,
//   leaveStatus,
//   deductedBalance,
//   policyName,
//   rejectReason,
//   leaves,
//   employees,
// }: updateRedisCacheType) => {
//   try {
//     const redis = RedisProvider.getInstance();

//     // Find employee + leave inside the cached arrays
//     const { value: leave, index: leaveIndex } = findWithIndex(leaves, leaveId);
//     const { value: employee, index: employeeIndex } = findWithIndex(
//       employees,
//       employeeId,
//     );

//     const { value: reportManager, index: reportManagerIndex } = findWithIndex(
//       employees,
//       (leave as Leave).actionByEmployeeId as string,
//     );

//     console.log({ leaveIndex, employeeIndex, reportManagerIndex });

//     // Updated leave object for cache
//     const updatedLeave: Leave = {
//       ...leave,
//       LeaveStatus: leaveStatus,
//       ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
//     };

//     // Updated employee object with:
//     //  - updated leave status inside leavesApplied[]
//     //  - updated balance (only if approved)
//     const updatedEmployee: Employee = {
//       ...employee,
//       leavesApplied: employee.leavesApplied.map((lv: Leave) =>
//         lv.id === leaveId
//           ? {
//               ...lv,
//               LeaveStatus: leaveStatus,
//               ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
//             }
//           : lv,
//       ),
//       ...(leaveStatus === LeaveStatus.APPROVED && {
//         leaveBalances: employee.leaveBalances.map(
//           (balance: EmployeeLeaveBalance) =>
//             balance.policyName === policyName
//               ? {
//                   ...balance,
//                   balance:
//                     (balance.balance as number) - (deductedBalance as number),
//                 }
//               : balance,
//         ),
//       }),
//     };
//     // update the ReportManager leave Actioned
//     const updatedReportManager: Employee = {
//       ...reportManager,
//       leavesActioned: reportManager.leavesActioned.map((leave: Leave) =>
//         leave.id === leaveId
//           ? {
//               ...leave,
//               LeaveStatus: leaveStatus,
//               ...(leaveStatus === LeaveStatus.REJECTED && { rejectReason }),
//             }
//           : leave,
//       ),
//     };

//     // Update Redis lists at specific index positions
//     await redis.updateListById("leaves:list", leaveIndex, updatedLeave);
//     await redis.updateListById(
//       "employees:list",
//       employeeIndex,
//       updatedEmployee,
//     );
//     await redis.updateListById(
//       "employees:list",
//       reportManagerIndex,
//       updatedReportManager,
//     );

//     console.log("Redis cache updated for leave + employee record");
//   } catch (error) {
//     // Cache failures should not block main workflow.
//     console.error("Redis cache update failed:", error);
//   }
// };
