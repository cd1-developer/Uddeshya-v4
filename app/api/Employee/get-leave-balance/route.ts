import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";
import POLICIES from "@/constant/Policies";
import { LeaveStatus } from "@/interfaces";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { employeeId } = params;

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 },
      );
    }
    const leaveBalances = await prisma.employeeLeaveBalance.findMany({
      where: { employeeId },
    });
    const leaves = await prisma.leave.findMany({
      where: { employeeId },
    });

    const allLeaveInfo = POLICIES.map((policy) => {
      const leaveType = policy.policyName;

      const policyBalance =
        leaveBalances.find(
          (leaveBalance) => leaveBalance.policyName === leaveType,
        )?.balance || 0;

      const approved = leaves.filter(
        (leave) =>
          leave.policyName === leaveType &&
          leave.LeaveStatus === LeaveStatus.APPROVED,
      ).length;
      const rejected = leaves.filter(
        (leave) =>
          leave.policyName === leaveType &&
          leave.LeaveStatus === LeaveStatus.REJECTED,
      ).length;
      const pending = leaves.filter(
        (leave) =>
          leave.policyName === leaveType &&
          leave.LeaveStatus === LeaveStatus.PENDING,
      ).length;

      return {
        policyName: leaveType,
        balance: policyBalance,
        approved,
        rejected,
        pending,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: allLeaveInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Leave Balance API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch leave balance" },
      { status: 500 },
    );
  }
};
