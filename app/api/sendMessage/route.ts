import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/helper/sendMessage";
import z from "zod";
import validateData from "@/helper/validateData";
import {
  otpEmailTemplate,
  WelcomeEmailTemplate,
} from "@/constant/EmailTemplate";

// Define a schema for validating the incoming request body.
const messageSchema = z.object({
  email: z.email({ message: "A valid email is required." }),
  subject: z.string().min(1, { message: "Subject cannot be empty." }),
  message: z.string().min(1, { message: "Message body cannot be empty." }),
  type: z.enum(["otp", "welcome"]), // Ensure type is one of the allowed values.
  otp: z.string().optional(), // OTP is optional, only required for 'otp' type.
});

export const POST = async (req: NextRequest) => {
  try {
    // Step 1: Parse and validate the JSON payload from the incoming request.
    const body = await req.json();
    const {
      success: validationSuccess,
      message: validationMessage,
      data,
    } = validateData(messageSchema, body);

    // If validation fails, return a 400 Bad Request response with the error details.
    if (!validationSuccess) {
      return NextResponse.json(
        { success: false, message: validationMessage },
        { status: 400 }
      );
    }

    // Destructure the validated data.
    const {
      email,
      subject,
      message: emailMessage,
      type,
      otp,
    } = data as z.infer<typeof messageSchema>;

    // Additional check: If type is 'otp', the otp field must be present.
    if (type === "otp" && !otp) {
      return NextResponse.json(
        { success: false, message: "OTP is required for type 'otp'." },
        { status: 400 }
      );
    }

    // Step 2: Dynamically select the appropriate email template.
    const template =
      type === "otp"
        ? otpEmailTemplate(otp!, emailMessage) // Use non-null assertion as we've validated it.
        : WelcomeEmailTemplate(emailMessage);

    // Step 3: Call the core `sendMessage` helper function with the prepared template, subject, and recipient email.
    const { success, message } = await sendMessage(template, subject, email);

    // Step 4: Return the result from the `sendMessage` function to the caller.
    return NextResponse.json({ success, message });
  } catch (error) {
    // If any error occurs during the process, log it for debugging purposes.
    console.error("Error in sendMessage API:", error);
    // Return a generic error response to the client with a 500 Internal Server Error status.
    return NextResponse.json(
      { success: false, message: "Failed to send message." },
      { status: 500 }
    );
  }
};
