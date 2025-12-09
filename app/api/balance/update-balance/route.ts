import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import validateData from "@/helper/validateData";
import { getEmployees, Employee } from "@/helper/getEmployees";
import { RedisProvider } from "@/libs/RedisProvider";
import getEmployeeInfo from "@/helper/getEmployeeInfo";

const updatedBalanceSchema = z.object({
  employeeId: z.string({ error: "Employee Id is required" }),
  balance: z.number({ error: "Balance is required" }),
  policyName: z.string({ error: "Policy Name is required" }),
});
export const PATCH = async (req: NextRequest) => {
  try {
    // 1. Parse the request body
    const body = await req.json();

    // 2. Validate the incoming data against the schema
    const { success, message, data } = validateData(updatedBalanceSchema, body);
    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    // 3. Destructure the validated data
    const { balance, employeeId, policyName } = data as z.infer<
      typeof updatedBalanceSchema
    >;

    // 4. Find the employee
    const employee = await getEmployeeInfo(employeeId);

    // 5. If employee doesn't exist, return a 404 error
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // 6. Find the specific leave balance for the employee and policy
    const leaveBalance = await prisma.employeeLeaveBalance.findFirst({
      where: {
        employeeId: employeeId,
        policyName: policyName,
      },
    });

    // 7. If the leave balance record doesn't exist, return a 404 error
    if (!leaveBalance) {
      return NextResponse.json(
        {
          success: false,
          message: "Leave Balance not found for the specified policy",
        },
        { status: 404 }
      );
    }

    // 8. Update the leave balance in the database
    await prisma.employeeLeaveBalance.update({
      where: {
        id: leaveBalance.id,
      },
      data: {
        balance: balance,
      },
    });

    // 9. Update the Redis cache to keep it in sync with the database
    await updateRedisCache(employeeId, balance, leaveBalance.id);

    // 10. Return a success response
    return NextResponse.json({
      success: true,
      message: "Leave Balance updated successfully",
    });
  } catch (error: any) {
    // Centralized error handling
    console.error("Error updating leave balance:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An internal server error occurred",
      },
      { status: 500 }
    );
  }
};

async function updateRedisCache(
  employee_id: string,
  balance: number,
  leaveBalanceId: string
) {
  try {
    // 1. Get all employees from cache (or DB if cache is empty)
    const employees = (await getEmployees()) || [];
    const redis = await RedisProvider.getInstance();

    // 2. Find the target employee and update their specific leave balance
    const updatedEmployees = employees.map((employee: Employee) =>
      employee.id === employee_id
        ? {
            ...employee,
            leaveBalances: employee.leaveBalances.map((balanceInfo) =>
              balanceInfo.id === leaveBalanceId
                ? { ...balanceInfo, balance }
                : balanceInfo
            ),
          }
        : employee
    );

    // 3. Save the entire updated employee list back to Redis
    await redis.set("Employees", updatedEmployees);
  } catch (error) {
    // Log the error but don't re-throw, as the primary DB operation succeeded.
    // A cache miss on the next request will self-heal this.
    console.error("Failed to update Redis cache for employees:", error);
  }
}
