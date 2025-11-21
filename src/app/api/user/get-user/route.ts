import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { id } = Object.fromEntries(searchParams.entries());

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Id is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
};
