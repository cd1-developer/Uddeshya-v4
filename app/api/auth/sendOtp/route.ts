import { NextRequest, NextResponse } from "next/server";
import { MessageQueueProvider } from "@/libs/MessageQueueProvider";
import generateOTP from "@/helper/generateOTP";
import { prisma } from "@/libs/prisma";
import z from "zod";
import validateData from "@/helper/validateData";

const emailSchema = z.object({
  email: z.email({ error: "Email is required" }),
});

export const POST = async (req: NextRequest) => {
  try {
    // Step 1: Get an instance of the message queue provider to handle asynchronous tasks.
    const queue = await MessageQueueProvider.getInstance();
    // Step 2: Parse the request body to get the user's email.
    const body = await req.json();

    const { success, message, data } = validateData(emailSchema, body);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const { email } = data as z.infer<typeof emailSchema>;

    // Step 3: Find the user in the database using their email.
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    // Step 4: If the user doesn't exist, return a "User not found" response.
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Step 5: Generate a new One-Time Password (OTP).
    const otp = generateOTP();
    // Step 6: Set the OTP expiration time to 1 minute from now.
    const expiresAt = new Date(Date.now() + 60000); // 1 minute expiry
    // Step 7: Create a new OTP record or update the existing one for the user.
    // `upsert` is used to avoid duplicate OTP entries for the same user.
    await prisma.oTP.upsert({
      where: { userId: user.id },
      update: { code: otp, expiresAt },
      create: { userId: user.id, code: otp, expiresAt },
    });

    // Step 8: Prepare the payload for the message queue job.
    // This payload contains all necessary info to send the OTP email.
    const payload = {
      email,
      subject: "Your Password Reset OTP – Do Not Share",
      message:
        "Here is your One-Time Password (OTP) for resetting your account password \n\n Please do not share this code with anyone for security reasons.If you did not request this, please ignore this message.",
      otp,
      type: "otp",
    };

    // Step 9: Publish a job to the message queue to send the email asynchronously.
    // This allows the API to respond quickly without waiting for the email to be sent.
    await queue.publishJob({
      url: `${process.env.API_ENDPOINT!}api/sendMessage`,
      payload,
    });

    // Step 10: Return a success response to the client.
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to send OTP",
      error: (error as Error).message,
    });
  }
};
