import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateLeave } from "../../../../../helper/validateLeave";

export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const { id } = params;
    const { success, message, status } = await validateLeave(id);

    if (!success) {
      return NextResponse.json({ success, message }, { status });
    }

    await prisma.leave.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting leave:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete leave",
        error: error.message || "Unknown Server Error",
      },
      { status: 500 }
    );
  }
};
