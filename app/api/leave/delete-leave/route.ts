import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateLeave } from "@/helper/validateLeave";
import { getEmployees } from "@/helper/getEmployees";
import { RedisProvider } from "@/libs/RedisProvider";
import { Leave } from "@prisma/client";
import { getLeave } from "@/helper/getLeave";
import { findWithIndex } from "@/helper/findWithIndex";

/**
 * API route handler for deleting a leave request.
 * It expects a leave 'id' as a URL search parameter.
 * The process involves validating the request, deleting the leave from the database,
 * and then invalidating the relevant Redis cache entries.
 *
 * @param {NextRequest} req - The incoming Next.js API request object.
 */
export const DELETE = async (req: NextRequest) => {
  try {
    // Extract the leave 'id' from the request URL.
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { id } = params;

    // Validate if the leave can be deleted (e.g., it's in a 'PENDING' state).
    const { success, message, status } = await validateLeave(id);
    if (!success) {
      return NextResponse.json({ success, message }, { status });
    }

    // Fetch the leave details to get associated employee and manager IDs for cache updates.
    const leave = await getLeave(id);
    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          message: "Leave not found",
        },
        { status: 404 }
      );
    }

    // 1. Update the database first (source of truth).
    await prisma.leave.delete({
      where: { id },
    });
    // 2. Then, update the Redis cache to reflect the deletion.
    await deleteLeaveFromCache(
      id,
      leave.employeeId,
      leave.actionByEmployeeId as string
    );

    return NextResponse.json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting leave:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete leave",
        error: error.message || "Unknown Server Error",
      },
      { status: 500 }
    );
  }
};

/**
 * Deletes a specific leave from all relevant locations in the Redis cache.
 * This ensures cache consistency after a leave is removed from the database.
 * The function performs the following operations:
 * 1. Removes the leave from the global `leaves:list`.
 * 2. Removes the leave from the `leavesApplied` array of the employee who submitted it.
 * 3. Removes the leave from the `leavesActioned` array of the reporting manager.
 *
 * @param {string} leaveId - The ID of the leave to remove.
 * @param {string} employeeId - The ID of the employee who applied for the leave.
 * @param {string} reportManagerId - The ID of the manager responsible for actioning the leave.
 */
const deleteLeaveFromCache = async (
  leaveId: string,
  employeeId: string,
  reportManagerId: string
) => {
  // Get a Redis client instance.
  const redis = RedisProvider.getInstance();

  // Fetch the entire list of employees from the cache to find the relevant records.
  // `getEmployees` will fetch from DB and cache if it's a miss.
  let employees = (await getEmployees()) || [];

  // Find the employee and their manager within the cached employee list.
  const { value: employee, index: employeeIndex } = findWithIndex(
    employees,
    employeeId
  );
  // Note: It's possible for a manager to not be found if they are not also an employee in the system.
  const { value: reportManager, index: reportManagerIndex } = findWithIndex(
    employees,
    reportManagerId
  );

  // Step 1: Remove the leave from the global 'leaves:list'.
  await redis.removeFromListById("leaves:list", leaveId);

  // Step 2: Update the employee's 'leavesApplied' list.
  if (employee && employeeIndex > -1) {
    const updatedEmployee = {
      ...employee,
      leavesApplied: employee.leavesApplied.filter(
        (leave: Leave) => leave.id !== leaveId
      ),
    };
    await redis.updateListById(
      "employees:list",
      employeeIndex,
      updatedEmployee
    );
  }

  // Step 3: Update the manager's 'leavesActioned' list.
  if (reportManager && reportManagerIndex > -1) {
    const updatedReportManager = {
      ...reportManager,
      leavesActioned: reportManager.leavesActioned.filter(
        (leave: Leave) => leave.id !== leaveId
      ),
    };
    await redis.updateListById(
      "employees:list",
      reportManagerIndex,
      updatedReportManager
    );
  }
};
