import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import validateData from "@/helper/validateData";

// Define a schema for validating the incoming request body.
const otpVerifySchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  code: z
    .string()
    .length(6, { message: "OTP code must be exactly 6 characters long." }),
});

export const POST = async (req: NextRequest) => {
  try {
    // Step 1: Parse and validate the JSON payload from the incoming request.
    const body = await req.json();
    const {
      success: validationSuccess,
      message: validationMessage,
      data,
    } = validateData(otpVerifySchema, body);

    // If validation fails, return a 400 Bad Request response with the error details.
    if (!validationSuccess) {
      return NextResponse.json(
        { success: false, message: validationMessage },
        { status: 400 }
      );
    }

    // Destructure the validated data.
    const { userId, code } = data as z.infer<typeof otpVerifySchema>;

    // Step 2: Find a matching OTP in the database that is not expired.
    const isOtpValid = await prisma.oTP.findFirst({
      where: {
        userId,
        code,
        expiresAt: { gt: new Date() }, // Check if the expiration time is in the future.
      },
    });

    // Step 3: If no valid OTP is found, return an "unauthorized" error.
    if (!isOtpValid) {
      return NextResponse.json(
        { success: false, message: "OTP expired or invalid" },
        { status: 401 }
      );
    }

    // Step 4: Clean up by deleting the used OTP to prevent reuse.
    await prisma.oTP.delete({ where: { id: isOtpValid.id } });

    // Step 5: Return a success response indicating the OTP was verified.
    return NextResponse.json({
      success: true,
      message: "OTP is now verified",
    });
  } catch (error) {
    // If any unexpected error occurs, log it for debugging.
    console.error("OTP verification error:", error);
    // Return a generic 500 Internal Server Error response.
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
