import { prisma } from "@/libs/prisma";
import validateData from "@/helper/validateData";
import z from "zod";
import { LeaveSchema } from "@//schemas/leave.schema";
import { NextRequest, NextResponse } from "next/server";
import { Leave } from "@prisma/client";
import { RedisProvider } from "@/libs/RedisProvider";
import { getEmployees } from "@/helper/getEmployees";

/**
 * API endpoint for an employee to apply for a leave.
 * It validates the leave request, creates a new leave record in the database,
 * and updates the Redis cache to reflect the new leave application.
 
 */
export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as any;

    // 1. Pre-process the request body: Convert date strings to Date objects for validation.
    body.startDateTime = new Date(body.startDateTime);
    if (body.endDateTime) {
      body.endDateTime = new Date(body.endDateTime);
    }

    // 2. Validate the request body against the leave schema.
    const {
      success,
      message,
      data: validLeaveData,
    } = validateData(LeaveSchema, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const {
      employeeId,
      policyName,
      startDateTime,
      startAbsentType,
      endDateTime,
      endAbsentType,
      reason,
      actionByEmployeeId,
    } = validLeaveData as z.infer<typeof LeaveSchema>;

    // 3. Verify that the employee applying for leave exists in the database.
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // 4. Prepare the data for creating the new leave record.
    const appliedLeaveData = {
      employeeId,
      policyName,
      startDateTime,
      startAbsentType,
      ...(endDateTime && { endDateTime }),
      ...(endAbsentType && { endAbsentType }),
      reason,
      actionByEmployeeId,
    };
    // 5. Create the new leave record in the database.
    const newAppliedLeave = await prisma.leave.create({
      data: appliedLeaveData,
      include: {
        applicant: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
        actionBy: true,
      },
    });

    // 6. Update the Redis cache with the new leave information.
    await updateLeavesInfoInCache(
      employeeId,
      employee.reportManagerId as string,
      newAppliedLeave
    );

    return NextResponse.json(
      {
        success: true,
        data: newAppliedLeave,
        message: "Leave applied successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    // 7. Handle any unexpected errors during the process.
    console.error("Error applying leave:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to apply leave",
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
};

/**
 * Updates the Redis cache after a new leave has been applied for.
 * This involves adding the leave to the main 'leaves' list, and also updating
 * the 'leavesApplied' list for the employee and the 'leavesActioned' list for their manager.
 * @param employeeId The ID of the employee who applied for the leave.
 * @param reportManagerId The ID of the employee's reporting manager.
 * @param leave The newly created leave object.
 */
async function updateLeavesInfoInCache(
  employeeId: string,
  reportManagerId: string,
  leave: Leave
) {
  const redis = await RedisProvider.getInstance();

  const employeess = (await getEmployees()) || [];

  // 1. Add the new leave to the global 'leaves' list in the cache.
  await redis.addToList<Leave>("leaves", leave);

  // 2. Find the applicant in the cached employees list and add the new leave
  //    to their 'leavesApplied' array.
  let updatedEmployees = employeess.map((employee) =>
    employee.id === employeeId
      ? {
          ...employee,
          leavesApplied: [...employee.leavesApplied, leave],
        }
      : employee
  );

  // 3. Find the reporting manager and add the new leave to their 'leavesActioned'
  //    array, so they can see it in their queue for approval/rejection.
  updatedEmployees = updatedEmployees.map((employee) =>
    employee.id === reportManagerId
      ? {
          ...employee,
          leavesActioned: [...employee.leavesActioned, leave],
        }
      : employee
  );

  // 4. Save the modified employee list back to the Redis cache.
  await redis.set("Employees", updatedEmployees);
}
