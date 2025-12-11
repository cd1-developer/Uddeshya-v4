import nodemailer from "nodemailer";
const APP_PASSWORD = process.env.APP_PASSWORD!;
const SENDER_EMAIL = process.env.SENDER_EMAIL!;

export const sendMessage = async (
  template: string,
  subject: string,
  notifer_email: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      port: 587,
      secure: true,
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `<${notifer_email}>`,
      to: notifer_email,
      subject,
      html: template,
    });

    return { success: true, message: "Email send successfully" };
  } catch (error: any) {
    return { success: false, message: "Failed to send message", error };
  }
};
