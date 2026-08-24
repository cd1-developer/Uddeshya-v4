import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import validateData from "@/helper/validateData";
import {
  getRequester,
  isManagerRole,
  canManage,
  scopeWhere,
} from "@/helper/userDetailsAuth";

// Fields returned for the edit form.
const USER_SELECT = {
  id: true,
  role: true,
  joiningDate: true,
  reportManagerId: true,
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      dateOfBirth: true,
      gender: true,
    },
  },
} as const;

/**
 * GET /api/user/manage?userId=<requester>&q=<search>
 *   → search list of manageable users (by email / username, partial match)
 * GET /api/user/manage?userId=<requester>&employeeId=<target>
 *   → details of a single manageable user
 *
 * Role-based access is enforced here, never trusted from the client.
 */
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const q = searchParams.get("q")?.trim();
    const employeeId = searchParams.get("employeeId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const requester = await getRequester(userId);
    if (!requester || !isManagerRole(requester.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized to manage user details" },
        { status: 403 },
      );
    }

    // Single user details.
    if (employeeId) {
      const target = await prisma.employee.findFirst({
        where: { id: employeeId },
        select: USER_SELECT,
      });
      if (!target || !canManage(requester, target)) {
        return NextResponse.json(
          { success: false, message: "User not found or access denied" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: target });
    }

    // Search list — DB-side filter + limit so it scales.
    const data = await prisma.employee.findMany({
      where: {
        ...scopeWhere(requester),
        ...(q
          ? {
              user: {
                is: {
                  OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            }
          : {}),
      },
      select: USER_SELECT,
      take: 50,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("User manage GET error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
};

const updateSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  dateOfBirth: z.date({ error: "Date of birth must be a valid date" }).optional(),
  joiningDate: z.date({ error: "Joining date must be a valid date" }).optional(),
  gender: z
    .enum(["Male", "Female"], { error: "Gender can be Male or Female" })
    .optional(),
});

/**
 * PATCH /api/user/manage?userId=<requester>&employeeId=<target>
 * Body: { username, email, dateOfBirth?, joiningDate?, gender? }
 */
export const PATCH = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const employeeId = searchParams.get("employeeId");

    if (!userId || !employeeId) {
      return NextResponse.json(
        { success: false, message: "userId and employeeId are required" },
        { status: 400 },
      );
    }

    const requester = await getRequester(userId);
    if (!requester || !isManagerRole(requester.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized to edit user details" },
        { status: 403 },
      );
    }

    const target = await prisma.employee.findFirst({
      where: { id: employeeId },
      select: { id: true, userId: true, reportManagerId: true },
    });
    if (!target || !canManage(requester, target)) {
      return NextResponse.json(
        { success: false, message: "User not found or access denied" },
        { status: 404 },
      );
    }

    const body = (await req.json()) as any;
    if (body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth);
    if (body.joiningDate) body.joiningDate = new Date(body.joiningDate);

    const { success, message, data } = validateData(updateSchema, body);
    if (!success) {
      return NextResponse.json({ success, message }, { status: 400 });
    }

    const { username, email, dateOfBirth, joiningDate, gender } =
      data as z.infer<typeof updateSchema>;

    // Email is unique — reject if another user already owns it.
    const emailOwner = await prisma.user.findFirst({
      where: { email, NOT: { id: target.userId } },
      select: { id: true },
    });
    if (emailOwner) {
      return NextResponse.json(
        {
          success: false,
          message: `The email ${email} is already registered to another user.`,
        },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: target.userId },
        data: {
          username,
          email,
          dateOfBirth: dateOfBirth ?? null,
          gender: gender ?? null,
        },
      }),
      prisma.employee.update({
        where: { id: target.id },
        data: { joiningDate: joiningDate ?? null },
      }),
    ]);

    const updated = await prisma.employee.findFirst({
      where: { id: target.id },
      select: USER_SELECT,
    });

    return NextResponse.json({
      success: true,
      message: "User details updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("User manage PATCH error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
};
