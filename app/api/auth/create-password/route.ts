import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/libs/prisma";
import { loginSchema } from "@/schemas/auth-schema";
import validateData from "@/helper/validateData";
import z from "zod";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { success, message, data } = validateData(loginSchema, body);

    if (!success) {
      return NextResponse.json(
        {
          success,
          message,
        },
        { status: 400 } // Use 400 for validation errors, not 404
      );
    }

    const { email, password } = data as z.infer<typeof loginSchema>;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password created successfully",
    });
  } catch (error) {
    console.error("Password API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
