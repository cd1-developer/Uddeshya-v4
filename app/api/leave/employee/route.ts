import { NextRequest, NextResponse } from "next/server";
import { getLeaves } from "@/helper/getLeaves";
import { Leave } from "@prisma/client";

/**
 * API endpoint to fetch all leave applications for a specific employee.
 * It retrieves the employee's leaves from the cache or database via the `getLeaves` helper.
 *
 * @param req The NextRequest object containing the employee ID in the URL search parameters.
 * @returns A NextResponse object containing the list of leaves for the specified employee.
 */
export const GET = async (req: NextRequest) => {
  try {
    // 1. Extract the employeeId from the request's URL search parameters.
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { employeeId } = params;

    // 2. Validate that an employeeId was provided.
    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee Id is required",
        },
        { status: 400 }
      );
    }

    // 3. Fetch all leaves from the cache (or database as a fallback).
    const leaves = (await getLeaves()) || [];

    // 4. Filter the leaves to find all applications submitted by the specified employee.
    const employeeLeaves = leaves.filter(
      (leave: Leave) => leave.employeeId === employeeId
    );

    // 5. Return the filtered list of leaves.
    return NextResponse.json({ success: true, data: employeeLeaves });
  } catch (error: any) {
    // 6. Handle any unexpected errors.
    console.error("Error fetching employee leaves:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch employee leaves",
      error: error.message || "Unknown server error",
    });
  }
};
