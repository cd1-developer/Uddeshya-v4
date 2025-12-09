import { prisma } from "@/libs/prisma";
import validateData from "@/helper/validateData";
import { NextResponse, NextRequest } from "next/server";
import z from "zod";

const EmailSchema = z.object({
  email: z.email(),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { success, message, data } = validateData(EmailSchema, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 401 });
    }
    const { email } = data as z.infer<typeof EmailSchema>;

    const isEmailExit = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!isEmailExit) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or user doesn't exist",
      });
    }

    const isPasswordExist = isEmailExit.password !== null;

    return NextResponse.json(
      {
        success: true,
        isPasswordExist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login handler:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Interval Server Error",
      },
      { status: 500 }
    );
  }
};
