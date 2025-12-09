import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";
import { Prisma } from "@prisma/client";

export type Employee = Prisma.EmployeeGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        email: true;
      };
    };
    reportManager: true;
    assignMembers: true;
    leaveBalances: true;
    EmployeeLatestIncrement: true;
    leavesApplied: true;
    leavesActioned: true;
  };
}>;

/**
 * Fetch all employees from Redis cache if available,
 * otherwise fetch from DB and cache the data.
 */
export const getEmployees = async (): Promise<Employee[] | null> => {
  const redis = await RedisProvider.getInstance();
  try {
    // Try from Redis
    let employees = await redis.get<Employee[]>("Employees");

    if (employees) {
      console.log("Cache HIT ✅: Employees from Redis");
      return employees;
    }

    console.log("Cache MISS ❌: Fetching employees from DB...");

    // Fetch from DB
    employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        reportManager: true,
        assignMembers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                dateOfBirth: true,
                gender: true,
                createdAt: true,
              },
            },
          },
        },
        leaveBalances: true,
        EmployeeLatestIncrement: true,
        leavesApplied: true,
        leavesActioned: {},
      },
    });

    // Save to cache for next time
    await redis.set<Employee[]>("Employees", employees);
    console.log("Employees saved to Redis cache 🔐");

    return employees;
  } catch (error: any) {
    console.error("Error getting employees:", error);
    return null;
  }
};
