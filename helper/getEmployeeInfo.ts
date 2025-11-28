import { Employee } from "@/interfaces";
import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";

/**
 * Fetches employee information by ID.
 * First tries Redis cache for better performance.
 * Falls back to database when cache does not have the data.
 */
const getEmployeeInfo = async (id: string) => {
  const redis = await RedisProvider.getInstance();
  try {
    // 🔹 Try to get all employees from Redis/cache
    const allEmployee = await redis.get<Employee[]>("Employees");

    // ❌ Cache MISS → Fetch only required employee from database
    if (!allEmployee) {
      console.log("Cache MISS ❌ → Fetching employee from DB");
      return await prisma.employee.findFirst({
        where: { id },
        include: {
          assignMembers: true,
          leavesApplied: true,
        },
      });
    }

    // ✨ Cache HIT → Fetch employee from cached list
    console.log("Cache HIT ✅ → Returning employee from Redis");
    const employeeInfo = allEmployee.find(
      (employee: Employee) => employee.id === id
    );

    return employeeInfo;
  } catch (error) {
    // 🔥 Handle unexpected failures (DB or Redis errors)
    console.error("Employee fetching error:", error);
    return null;
  }
};

export default getEmployeeInfo;
