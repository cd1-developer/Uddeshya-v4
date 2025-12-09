import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateLeave } from "@/helper/validateLeave";
import { getLeaves } from "@/helper/getLeaves";
import { getEmployees } from "@/helper/getEmployees";
import { RedisProvider } from "@/libs/RedisProvider";
import { Leave } from "@prisma/client";

export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { id } = params;
    const { success, message, status } = await validateLeave(id);

    if (!success) {
      return NextResponse.json({ success, message }, { status });
    }
    // Udpate the db first
    await prisma.leave.delete({
      where: { id },
    });
    // then update the redis cache
    await deleteLeaveFromCache(id);

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
 * Removes a deleted leave from the Redis cache.
 * This function updates both the global 'leaves' list and the specific
 * 'leavesApplied' and 'leavesActioned' arrays within each employee's cached data.
 *
 * @param leaveId The ID of the leave to be removed from the cache.
 */
const deleteLeaveFromCache = async (leaveId: string) => {
  // 1. Fetch the current state of leaves and employees from the cache.
  const leaves = (await getLeaves()) || [];
  const employees = (await getEmployees()) || [];
  const redis = await RedisProvider.getInstance();

  // 2. Create a new list of leaves, excluding the one that was deleted.
  const updatedLeaves = leaves.filter((leave) => leave.id !== leaveId);

  // 3. Iterate over all employees to remove the deleted leave from their related lists.
  let updatedEmployees = employees.map((employee) => {
    // Remove the leave from the employee's list of applied leaves.
    const updatedLeavesApplied = employee.leavesApplied.filter(
      (leave: Leave) => leave.id !== leaveId
    );
    // Remove the leave from the employee's (if they are a manager) list of leaves to be actioned.
    const updatedLeaveActioned = employee.leavesActioned.filter(
      (leave: Leave) => leave.id !== leaveId
    );

    return {
      ...employee,
      leavesApplied: updatedLeavesApplied,
      leavesActioned: updatedLeaveActioned,
    };
  });

  // 4. Write the updated lists back to the Redis cache.
  await redis.set("leaves", updatedLeaves);
  await redis.set("Employees", updatedEmployees);
};
