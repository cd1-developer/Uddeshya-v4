import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import getEmployeeInfo from "@/helper/getEmployeeInfo";
import { RedisProvider } from "@/libs/RedisProvider";
import { Employee } from "@/helper/getEmployees";
import { getEmployees } from "@/helper/getEmployees";
import { findWithIndex } from "@/helper/findWithIndex";

/**
 * API endpoint to assign a reporting manager to one or more employees.
 * It updates the database and then synchronizes the changes with the Redis cache.
 
 */
export const POST = async (req: NextRequest) => {
  try {
    // 1. Extract report manager and employee IDs from the request body.
    const { reportManagerId, selectedEmployeesId } = (await req.json()) as {
      reportManagerId: string;
      selectedEmployeesId: string[];
    };

    // 2. Validate that all required IDs are present.
    if (
      !reportManagerId ||
      !selectedEmployeesId ||
      selectedEmployeesId.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Report manager ID and employee ID are required",
        },
        { status: 400 }
      );
    }

    // 3. Fetch information for the report manager and the selected employees.
    // `getEmployeeInfo` attempts to use the cache first for performance.
    const reportManagerInfo = await getEmployeeInfo(reportManagerId);
    const employeesInfo = (await Promise.all(
      selectedEmployeesId
        .map((employeeId) => getEmployeeInfo(employeeId))
        .filter((emp) => emp !== null)
    )) as Employee[];

    // 4. Ensure the report manager exists.
    if (!reportManagerInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "Report manager not found",
        },
        { status: 404 }
      );
    }

    // 5. Ensure at least one of the selected employees exists.
    if (employeesInfo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Employees not found",
        },
        { status: 404 }
      );
    }

    // 6. Atomically update the database.
    // Assign the new report manager to all valid selected employees.
    await prisma.employee.updateMany({
      where: {
        id: {
          in: employeesInfo.map((emp) => emp.id),
        },
      },
      data: {
        reportManagerId,
      },
    });

    // 7. Update the Redis cache to reflect the changes.
    await updateReportManagerInCache(
      reportManagerInfo as Employee,
      employeesInfo as Employee[]
    );

    return NextResponse.json({
      success: true,
      message: "Report manager assigned successfully",
    });
  } catch (error: any) {
    // 8. Handle any unexpected errors during the process.
    console.error("Assign Manager Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign report manager",
        error: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
};

/**
 * Updates Redis cache when employees are assigned to a report manager.
 *
 * This function ensures cache consistency by:
 *  1. Updating the manager's `assignMembers` list.
 *  2. Updating each assigned employee to reference their new report manager.
 *
 * Both updates happen in Redis without refetching all data, preserving performance.
 *
 * @param reportManagerInfo - The full employee object of the manager.
 * @param employeesInfo - List of employees newly assigned to this manager.
 */
async function updateReportManagerInCache(
  reportManagerInfo: Employee,
  employeesInfo: Employee[]
) {
  // Fetch all employees from cache for lookup + updates.
  const employees = await getEmployees();
  const redis = RedisProvider.getInstance();

  /**
   * We loop over all employees involved in assignment:
   *
   *  - If employee === reportManager:
   *        → Update their `assignMembers` array to include all assigned employees.
   *
   *  - If employee is one of the assigned employees:
   *        → Set `reportManagerId` and embed full manager object.
   *
   * Promise.all ensures all Redis updates execute in parallel for optimal performance.
   */
  await Promise.all(
    employeesInfo.map(async (emp: Employee) => {
      const { index } = findWithIndex(employees as Employee[], emp.id);

      // ---------------------------------------------
      // CASE 1: Update manager's "assignMembers" list
      // ---------------------------------------------
      if (emp.id === reportManagerInfo.id) {
        const updatedReportManager = {
          ...emp,
          // Ensure append behavior (avoid overwriting existing members)
          assignMembers: [...(emp.assignMembers ?? []), ...employeesInfo],
        };

        return redis.updateListById(
          "employees:list",
          index,
          updatedReportManager
        );
      }

      // ---------------------------------------------
      // CASE 2: Update each assigned employee with their manager reference
      // ---------------------------------------------
      if (employeesInfo.some((selectedEmp) => emp.id === selectedEmp.id)) {
        const updatedEmployee = {
          ...emp,
          reportManagerId: reportManagerInfo.id,
          reportManager: reportManagerInfo,
        };

        return redis.updateListById("employees:list", index, updatedEmployee);
      }
    })
  );
}
