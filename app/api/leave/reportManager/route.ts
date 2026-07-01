import { NextRequest, NextResponse } from "next/server";
import { getLeaves } from "@/helper/getLeaves";
import { Leave } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    // 1. Extract the reportManagerId from the request's URL search parameters.
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { reportManagerId } = params;

    // 2. Validate that an employeeId was provided.
    if (!reportManagerId) {
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

    // 4. Filter the leaves to find all applications submitted by the specified reportManagerId.
    const actionedLeaves = leaves.filter(
      (leave: Leave) => leave.actionByEmployeeId === reportManagerId
    );
    // 5. Return the filtered list of leaves.
    return NextResponse.json({ success: true, data: actionedLeaves });
  } catch (error: any) {
    // 6. Handle any unexpected errors.
    console.error("Error fetching actioned leaves:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch actioned leaves",
      error: error.message || "Unknown server error",
    });
  }
};
