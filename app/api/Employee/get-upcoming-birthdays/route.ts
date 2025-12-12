import { Employee, getEmployees } from "@/helper/getEmployees";
import { UpComingDOBType } from "@/interfaces";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const employees = (await getEmployees()) || [];

    if (employees.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    const upComingBirthDays = employees
      .filter((emp: Employee) => {
        const dob = emp?.user?.dateOfBirth;
        console.log(dob);

        if (!dob) return false;

        const birthDate = new Date(dob);
        const birthdayThisYear = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate()
        );

        return birthdayThisYear >= today;
      })
      .map((emp) => ({
        id: emp.id,
        username: emp.user.username,
        dateOfBirth: emp.user.dateOfBirth,
      })) as UpComingDOBType[];

    return NextResponse.json({ success: true, data: upComingBirthDays });
  } catch (error: any) {
    console.error("Error fetching upcoming birthdays:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch upcoming birthdays",
        error: error?.message,
      },
      { status: 500 }
    );
  }
};
