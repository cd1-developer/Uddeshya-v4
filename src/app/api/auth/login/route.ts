import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../libs/prisma";
import { loginSchema } from "../../../../../schemas/auth-schema";
import validateData from "../../../../../helper/validateData";
import bcryptjs from "bcryptjs";
import { z } from "zod";

type LoginTypes = z.infer<typeof loginSchema>;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { success, message, data } = validateData(loginSchema, body);

    if (!success) {
      return NextResponse.json({
        success,
        message,
      });
    }

    const { email, password } = data as LoginTypes;

    const isUserExist = await prisma.user.findFirst({
      where: { email },
    });

    if (!isUserExist) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or user doesn't exist",
      });
    }

    const isValidPassword = await bcryptjs.compare(
      password,
      isUserExist.password as string
    );

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: "Invalid password",
      });
    }

    const response = {
      success: true,
      message: "Login successful",
      user: {
        id: isUserExist.id,
        username: isUserExist.username,
        email: isUserExist.email,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong, please try again later",
      },
      { status: 500 }
    );
  }
};
