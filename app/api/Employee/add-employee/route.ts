import { Role } from "@/interfaces";
import validateData from "@/helper/validateData";
import { prisma } from "@/libs/prisma";
import { findUser } from "@/helper/findUser";
import { NextRequest, NextResponse } from "next/server";
import { RedisProvider } from "@/libs/RedisProvider";
import z from "zod";
import { Employee, getEmployees } from "@/helper/getEmployees";
import { MessageQueueProvider } from "@/libs/MessageQueueProvider";

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
    const { exists, email } = await findUser(userId);
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
    await redis.addToList("employees:list", newEmployee as Employee);

    // Step 15: Notifiy User when new added to the organisation
    await NotifyUser(email as string, newEmployee.user.username);

    // Step 16: Return a 201 Created response with the new employee data.
    return NextResponse.json(
      { success: true, data: newEmployee },
      { status: 201 }
    );
  } catch (error: any) {
    // Step 17: Handle any unexpected errors that occur during the process.
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

/**
 * NotifyUser()
 * -------------------------------------------
 * PURPOSE:
 * Sends a welcome email to a newly added user by pushing
 * a job into the message queue.
 *
 * FLOW:
 * 1. Fetch employee list
 * 2. Identify the ADMIN user (sender)
 * 3. Build the email payload
 * 4. Publish a job to the queue (asynchronous email sending)
 *
 * NOTES:
 * - Uses MessageQueueProvider for decoupling and scalability
 * - Email delivery handled in a background queue, not blocking request
 */
const NotifyUser = async (email: string, username: string) => {
  // 1. Get the list of employees (fallback to empty array if null)
  const employees = (await getEmployees()) || [];

  // 2. Get queue instance (Singleton pattern ensures only one instance is used)
  const queue = await MessageQueueProvider.getInstance();

  // 3. Find the admin user — used as the "actor" who added the new user
  const admin = employees.find((employee) => employee.role === Role.ADMIN);

  // 4. Build payload that will be sent to the mail service
  const payload = {
    email,
    subject: "Welcome to the SOCIAL THREE SIXTY Leave Management System",
    message: `Hello ${username},\n\n
    You have been successfully added to the SOCIAL THREE SIXTY Leave Management System by ${admin?.user.username}.\n\n
    Welcome aboard!
    The SOCIAL THREE SIXTY Team`,
    type: "welcome",
  };

  // 5. Push the job into message queue
  //    This allows the /api/sendMessage endpoint to handle it asynchronously.
  await queue.publishJob({
    url: `${process.env.API_ENDPOINT!}api/sendMessage`,
    payload,
  });
};
