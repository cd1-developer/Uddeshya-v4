import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { RedisProvider } from "@/libs/RedisProvider";
import { Employee } from "@prisma/client";

// Create a single Redis client instance for this API route
const redis = new RedisProvider();

export const GET = async () => {
  try {
    // Attempt to load employee data from Redis cache
    let allEmployee: Employee[] | null = await redis.get("Employees");

    // If no cached data exists → query DB and store into Redis
    if (!allEmployee) {
      console.log("Cache MISS ❌ → Fetching employee data from DB...");

      allEmployee = await prisma.employee.findMany({
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

      // Store fresh DB data into Redis for future fast access
      await redis.set("Employees", allEmployee);
      console.log("Employees stored in Redis cache 🔐");
    } else {
      console.log("Cache HIT ✅ → Returning data from Redis");
    }

    // Send response to client
    return NextResponse.json(
      { success: true, data: allEmployee },
      { status: 200 }
    );
  } catch (error: any) {
    // Log and return a user-friendly error response if something breaks
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch employee data",
      },
      { status: 500 }
    );
  }
};
