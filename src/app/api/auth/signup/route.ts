import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { signupSchema } from "../../../../../schemas/auth-schema";
import bcrypt from "bcryptjs";
import validateData from "../../../../../helper/validateData";
import { Prisma } from "@prisma/client";
import { z } from "zod";

type SignupTypes = z.infer<typeof signupSchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    // ✅ Validate input using schema
    const { success, message, data } = validateData(signupSchema, body);
    if (!success) {
      return NextResponse.json(
        { success, message },
        { status: 400 } // Bad Request
      );
    }

    const { username, email, password, gender, dateOfBirth } =
      data as SignupTypes;

    // 🔍 Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already taken. Please use another one",
        },
        { status: 409 } // Conflict
      );
    }

    // 🧩 Handle optional fields cleanly
    const personalInfo = {
      ...(gender && { gender }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
    };

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 🏗 Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        ...(hashedPassword && { password: hashedPassword }),
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
  } catch (error: any) {
    console.log("Failed to create user:", error);

    // 🎯 Specific Prisma unique constraint error handling
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
