import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { signupSchema } from "../../../../../schemas/auth-schema";
import bcrypt from "bcryptjs";
import validateData from "../../../../../helper/validateData";
import { z } from "zod";

type SignupTypes = z.infer<typeof signupSchema>;
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    // ✅ Validate input
    const { success, message, data } = validateData(signupSchema, body);
    if (!success) {
      return NextResponse.json(
        {
          success,
          message,
        },
        { status: 404 }
      );
    }
    const { username, email, password } = data as SignupTypes;

    // ✅ Check if user already exists
    const isExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (isExist) {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already taken. Please use another one",
        },
        { status: 409 }
      );
    }
    let user;
    if (password) {
      // ✅ Hash password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      //todo    <----- ✅ Create new user

      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashPassword,
        },
      });
    } else {
      //todo    <-----When member will be added into organisation with their email and username
      user = await prisma.user.create({
        data: {
          username,
          email,
        },
      });
    }

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
    console.log(`Failed to create user :${error.message}`);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 400 }
    );
  }
};
