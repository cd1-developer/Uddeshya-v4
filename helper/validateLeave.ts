import { prisma } from "@/libs/prisma";
import { LeaveStatus } from "@/interfaces";
import { getLeaves } from "./getLeaves";

export const validateLeave = async (id: string) => {
  try {
    if (!id) {
      return {
        success: false,
        message: "Leave ID is required",
        status: 400,
      };
    }
    const leaves = (await getLeaves()) || [];

    const leave =
      leaves.find((leaveInfo) => leaveInfo.id === id) ||
      (await prisma.leave.findFirst({
        where: { id },
      }));

    if (!leave) {
      return {
        success: false,
        message: "Leave not found",
        status: 404,
      };
    }

    if (leave.LeaveStatus !== LeaveStatus.PENDING) {
      return {
        success: false,
        message: "You can only delete or update pending leaves",
        status: 403,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Leave validation error:", error);
    return {
      success: false,
      message: "Error validating leave",
      error: error.message || "Unknown server error",
      status: 500,
    };
  }
};
