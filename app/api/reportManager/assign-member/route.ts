import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import getEmployeeInfo from "@/helper/getEmployeeInfo";
import { RedisProvider } from "@/libs/RedisProvider";
import { Employee } from "@/helper/getEmployees";
import { getEmployees } from "@/helper/getEmployees";

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
 * Updates the "Employees" list in the Redis cache after a report manager assignment.
 * This function ensures the cached data is consistent with the database changes.
 
 * @param reportManagerInfo The full object of the reporting manager.
 * @param employeesInfo An array of employee objects that were assigned to the manager.
 */
async function updateReportManagerInCache(
  reportManagerInfo: Employee,
  employeesInfo: Employee[]
) {
  // Fetch the entire list of employees from the cache/source.
  const employess = await getEmployees();
  const redis = await RedisProvider.getInstance();

  // First pass: Update the reporting manager's `assignMembers` list.
  let updatedEmployees = employess?.map((employee) =>
    employee.id === reportManagerInfo.id
      ? {
          ...employee,
          // Add the newly assigned employees to the manager's list of direct reports.
          assignMembers: [...(employee.assignMembers ?? []), ...employeesInfo],
        }
      : employee
  );

  // Second pass: Update the `reportManager` field for each assigned employee.
  updatedEmployees = updatedEmployees?.map((employee) =>
    employeesInfo.some((emp) => emp.id === employee.id)
      ? // Set the report manager details on the employee object.
        {
          ...employee,
          reportManagerId: reportManagerInfo.id,
          reportManager: reportManagerInfo,
        }
      : employee
  );

  // Write the fully updated employee list back to the Redis cache.
  await redis.set("Employees", updatedEmployees);
}
