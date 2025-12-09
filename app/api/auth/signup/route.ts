import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { signupSchema } from "@/schemas/auth-schema";
import bcrypt from "bcryptjs";
import z from "zod";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (body.dateOfBirth) {
      body.dateOfBirth = new Date(body.dateOfBirth);
    }

    // ✅ Validate input using schema
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 } // Bad Request
      );
    }

    const { username, email, password, gender, dateOfBirth } =
      validation.data as z.infer<typeof signupSchema>;

    // 🧩 Handle optional fields cleanly
    const personalInfo = {
      ...(gender && { gender }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
    };

    // 🏗 Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password as string, 10),
        ...personalInfo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Failed to create user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
