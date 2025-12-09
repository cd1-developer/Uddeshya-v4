import { Role } from "@/interfaces";
import validateData from "@/helper/validateData";
import { prisma } from "@/libs/prisma";
import { findUser } from "@/helper/findUser";
import { NextRequest, NextResponse } from "next/server";
import { RedisProvider } from "@/libs/RedisProvider";
import z from "zod";
import { Employee } from "@/helper/getEmployees";

// Step 1: Define the validation schema for the incoming request body using Zod.
const addEmployeeSchema = z.object({
  userId: z.string({ error: "userId is required" }),
  role: z.enum(Role, {
    error: "Role can be ADMIN , SUB_ADMIN , MEMBER or REPORT_MANAGER",
  }),
  joiningDate: z.date({ error: "joiningDate should be of date format." }),
  probationEnd: z.date({ error: "Probation period should be of date format." }),
  status: z.enum(["Active", "Probation"], {
    error: "Status can be Active or Probation ",
  }),
  leaveBalanceInfo: z
    .array(
      z.object({
        policyName: z.string(),
        balance: z.number(),
      })
    )
    .optional(),
});

// Step 2: Define the POST request handler for the '/api/Employee/add-employee' endpoint.
export const POST = async (req: NextRequest) => {
  // Step 3: Get an instance of the Redis client for caching.
  const redis = await RedisProvider.getInstance();
  try {
    // Step 4: Parse the JSON body from the incoming request.
    const body = (await req.json()) as any;
    // Step 5: Convert date strings from the body to Date objects for validation.
    body.joiningDate = new Date(body.joiningDate);
    body.probationEnd = new Date(body.probationEnd);

    // Step 6: Validate the request body against the 'addEmployeeSchema'.
    const { success, message, data } = validateData(addEmployeeSchema, body);

    console.log(data);

    // Step 7: If validation fails, return a 400 Bad Request response with the error message.
    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    // Step 8: Destructure the validated data for easier access.
    const {
      userId,
      role,
      joiningDate,
      probationEnd,
      status,
      leaveBalanceInfo,
    } = data as z.infer<typeof addEmployeeSchema>;

    // Step 9: Check if the user with the given 'userId' exists in the database.
    const { exists } = await findUser(userId);
    // Step 10: If the user does not exist, return a 404 Not Found response.
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Step 11: Create a new employee record in the database with the validated data.
    let newEmployee = await prisma.employee.create({
      data: {
        userId,
        role,
        joiningDate,
        probationEnd,
        status,
      },
      // Include related user and other employee details in the response.
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        reportManager: true,
        assignMembers: true,
        leaveBalances: true,
        EmployeeLatestIncrement: true,
        leavesApplied: true,
        leavesActioned: true,
      },
    });

    // Step 12: If 'leaveBalanceInfo' is provided, create corresponding leave balance records.
    if (leaveBalanceInfo && leaveBalanceInfo?.length > 0) {
      const employeeLeaveBalanceInfo = await Promise.all(
        leaveBalanceInfo.map(async (balanceInfo) => {
          let { policyName, balance } = balanceInfo;
          return prisma.employeeLeaveBalance.create({
            data: {
              employeeId: newEmployee.id,
              policyName,
              balance,
            },
            include: {
              employee: true,
            },
          });
        })
      );

      // Step 13: Append the newly created leave balances to the 'newEmployee' object.
      newEmployee = { ...newEmployee, leaveBalances: employeeLeaveBalanceInfo };
    }

    // Step 14: Cache the newly created employee data by adding it to the 'Employees' list in Redis.
    await redis.addToList<Employee>("Employees", newEmployee);

    // Step 15: Return a 201 Created response with the new employee data.
    return NextResponse.json(
      { success: true, data: newEmployee },
      { status: 201 }
    );
  } catch (error: any) {
    // Step 16: Handle any unexpected errors that occur during the process.
    console.error("Add Employee Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
