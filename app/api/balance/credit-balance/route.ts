import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { getYear, format, parse } from "date-fns";
import POLICIES from "@/constant/Policies";
import { leavePolicy, AccuralFrequency } from "@/interfaces";
import { EmployeeLeaveBalance, Role } from "@prisma/client";
import { getEmployees } from "@/helper/getEmployees";
import { RedisProvider } from "@/libs/RedisProvider";

export const POST = async () => {
  try {
    // 🗓️ Current date setup
    const currentDate = new Date();
    const currentYear = getYear(currentDate);
    const formattedCurrentDate = "1-October-2025"; //formatDate(currentDate, currentYear); // e.g. "11-November-2025"

    const redis = await RedisProvider.getInstance();

    // 🧮 Generate monthlyPeriods and qaurterPeriods
    const monthlyPeriod = months(currentYear).map(
      (month) => `1-${month}-${currentYear}`
    );

    const quarterPeriods = monthlyPeriod.filter((_, index) => index % 3 === 0);

    const isMonthlyPeriod = monthlyPeriod.includes(formattedCurrentDate);
    const isQuarterPeriod = quarterPeriods.includes(formattedCurrentDate);

    // 🚫 If not a valid monthly/quarterly period, skip DB calls
    if (!isMonthlyPeriod) {
      return NextResponse.json({
        success: true,
        message: "Current date does not match any monthly or quarterly period",
      });
    }

    // 👥 Fetch organisation members (excluding admins)
    const employees = ((await getEmployees()) || []).filter(
      (emp) => emp.role !== Role.ADMIN
    );
    const creditBalanceTask = [];

    // ⚙️ Iterate members sequentially for reliable async behavior
    for (const member of employees) {
      const latestIncrements = member.EmployeeLatestIncrement;
      const monthlyLeaveTypes = POLICIES.filter(
        (leaveType) => leaveType.accuralFrequency === AccuralFrequency.Monthly
      ).filter((policy) => policy.accural !== 0);

      // If not leave creadited to orgMember then credit the leave

      if (latestIncrements.length === 0) {
        creditBalanceTask.push(
          creditLeaveBalance(
            monthlyLeaveTypes,
            member.id,
            member.leaveBalances,
            formattedCurrentDate
          )
        );
      } else {
        let alreadyCredited = false;

        for (const increment of latestIncrements) {
          const isLeaveType = monthlyLeaveTypes.some(
            (lt) => lt.policyName === increment.policyName
          );

          const sameDate =
            format(increment.dateOfIncrement, "d-MMMM-yyyy") ===
            formattedCurrentDate;
          // If current date is found in latest increment and
          // the leaveType (Policy Name) of Monlthy leave === leaveType (Policy Name) of latestIncrements
          if (sameDate && isLeaveType) {
            alreadyCredited = true;
            break;
          }
        }

        if (!alreadyCredited) {
          await creditLeaveBalance(
            monthlyLeaveTypes,
            member.id,
            member.leaveBalances,
            formattedCurrentDate
          );
        }
      }
    }

    // 📆 Quarterly updates (only if required)
    if (isQuarterPeriod) {
      const quarterLeaves = POLICIES.filter(
        (leaveType) => leaveType.accuralFrequency === AccuralFrequency.Quarterly
      ).filter((policy) => policy.accural !== 0);

      for (const member of employees) {
        const latestIncrements = member.EmployeeLatestIncrement;
        let alreadyCredited = false;

        for (const increment of latestIncrements) {
          const isLeaveType = quarterLeaves.some(
            (lt) => lt.policyName === increment.policyName
          );

          const sameDate =
            format(increment.dateOfIncrement, "d-MMMM-yyyy") ===
            formattedCurrentDate;
          // If current date is found in latest increment and
          // the leaveType (Policy Name) of Quarter leave === leaveType (Policy Name) of latestIncrements
          if (sameDate && isLeaveType) {
            alreadyCredited = true;
            break;
          }
        }

        if (!alreadyCredited) {
          creditBalanceTask.push(
            creditLeaveBalance(
              quarterLeaves,
              member.id,
              member.leaveBalances,
              formattedCurrentDate
            )
          );
        }
      }
    }

    // make Parrel api calling after that i will clear the redis state
    await Promise.all(creditBalanceTask);

    await redis.del("employees:list");
    await redis.del("leaves:list");

    return NextResponse.json({
      success: true,
      message: isQuarterPeriod
        ? "Quarterly and Monthly leaves updated successfully"
        : "Monthly leaves updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred while updating leaves",
    });
  }
};

// 🔹 Utility: Generate Month Names
const months = (year: number) =>
  Array.from({ length: 12 }, (_, i) => format(new Date(year, i, 1), "MMMM"));

// 🔹 Utility: Credit Leave Balance
async function creditLeaveBalance(
  leaveTypes: leavePolicy[],
  employeeId: string,
  totalBalances: EmployeeLeaveBalance[],
  formattedDate: string
) {
  for (const leaveType of leaveTypes) {
    // Find the existing balance for this specific leave type
    const existingBalance = totalBalances.find(
      (balance) => balance.policyName === leaveType.policyName
    );
    // Check if the organization member already has any leave balance records.
    // - If not: create new total balance entries for all applicable leave types.
    // - If yes: update the balance for those leave types accordingly.
    // Or If Leave Type is not found in the total balance then create the new Leave balance
    // ( beacuse leave type can newly added in the organisation)

    if (totalBalances.length === 0 || !existingBalance) {
      await prisma.employeeLeaveBalance.create({
        data: {
          balance: leaveType.accural,
          policyName: leaveType.policyName,
          employeeId: employeeId,
        },
      });
    } else {
      if (existingBalance) {
        await prisma.employeeLeaveBalance.update({
          where: {
            id: existingBalance.id,
          },
          data: {
            balance: existingBalance.balance + leaveType.accural,
          },
        });
      }
    }

    await prisma.employeeLatestIncrement.create({
      data: {
        dateOfIncrement: parse(formattedDate, "d-MMMM-yyyy", new Date()),
        policyName: leaveType.policyName,
        employee_id: employeeId,
      },
    });
  }
}
