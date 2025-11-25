import { prisma } from "@/libs/prisma";
import { RedisProvider } from "@/libs/RedisProvider";
import { User } from "@/interfaces";
import { NextRequest, NextResponse } from "next/server";

const redis = new RedisProvider();

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { id } = Object.fromEntries(searchParams.entries());

    if (!id) {
      console.warn("⚠️ Missing 'id' in request query");
      return NextResponse.json(
        { success: false, message: "Id is required" },
        { status: 400 }
      );
    }

    // Try to get user from Redis Cache
    let user = (await redis.get(`user:${id}`)) as User;
    if (user) {
      console.log("✨ Cache HIT → Returning user from Redis");
    }

    // If cache miss → fetch from DB
    if (!user) {
      console.log("❌ Cache MISS → Fetching user from database...");

      const db_user = (await prisma.user.findFirst({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          gender: true,
          dateOfBirth: true,
          createdAt: true,
        },
      })) as User | null;

      if (!db_user) {
        console.warn("🚫 User not found in database");
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      user = db_user;

      await redis.set<User>(`user:${id}`, user);
      console.log("🔐 User stored in Redis cache");
    }

    console.log("✅ User fetched successfully");

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("🔥 Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
};
