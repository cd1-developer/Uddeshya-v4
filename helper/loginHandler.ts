import { prisma } from "@/libs/prisma";
import { loginSchema } from "../schemas/auth-schema";
import validateData from "./validateData";
import bcryptjs from "bcryptjs";
import { z } from "zod";

type LoginTypes = z.infer<typeof loginSchema>;

export const LoginHandler = async (email: string, password: string) => {
  try {
    // ✔ Validate input with Zod
    const { success, message, data } = validateData(loginSchema, {
      email,
      password,
    });

    if (!success) {
      return {
        success: false,
        message,
      };
    }

    const { email: userEmail, password: userPassword } = data as LoginTypes;

    // ✔ Find user
    let isUserExist = await prisma.user.findFirst({
      where: { email: userEmail },
      include: {
        employee: {
          select: {
            id: true,
            role: true,
            reportManagerId: true,
          },
        },
      },
    });

    if (!isUserExist) {
      return {
        success: false,
        message: "Invalid email or user doesn't exist",
      };
    }

    if (isUserExist.employee) {
      const admin = await prisma.employee.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      isUserExist.employee.reportManagerId =
        isUserExist.employee.reportManagerId ?? admin?.id!;
    }
    const isValidPassword = await bcryptjs.compare(
      userPassword,
      isUserExist.password as string,
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    // ✔ SUCCESS RESPONSE
    return {
      success: true,
      message: "Login successful",
      user: {
        id: isUserExist.id,
        username: isUserExist.username,
        email: isUserExist.email,
        role: isUserExist.employee?.role,
        employee_id: isUserExist.employee?.id,
        reportManagerId: isUserExist.employee?.reportManagerId,
      },
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Something went wrong, please try again later",
    };
  }
};
