import { eachDayOfInterval, format } from "date-fns";
import { AbsentType, leavePolicy } from "@/interfaces";
import { Holiday } from "@prisma/client";

interface getBalanceType {
  startDateTime: Date;
  endDateTime: Date;
  startAbsentType: string;
  endAbsentType?: string;
  leavePolicies: leavePolicy;
  holidays: Holiday[];
}

export const getBalance = ({
  startDateTime,
  endDateTime,
  startAbsentType,
  endAbsentType,
  leavePolicies,
  holidays,
}: getBalanceType) => {
  let balance = 0;

  // If startAbsentType === First Half then StartDate and EndDate whould be Same and Balance to be deduct is 0.5 (Half leave deduct)
  if (startAbsentType === AbsentType.FIRST_HALF) {
    balance = 0.5;
  } else {
    const isSandwitch = leavePolicies.sandwich;
    // IF SandWitch is true then include the Sundays and Holidays else Exclude sundays and Holidays
    // 🪜 Step 1: Get all the dates between the Start Date and End Date
    // --------------------------------------------------------------
    // In this step, we’ll create an array that contains every date
    // between the start date and end date (including both).
    //
    // Each item in the array will be an object with two properties:
    //   1️⃣ date → The actual date (e.g., "15-11-2025")
    //   2️⃣ day  → The name of the day (e.g., "Saturday")
    //
    // Example:
    // If startDate = 15-11-2025 and endDate = 18-11-2025,
    // The result will look like this 👇
    //
    // [
    //   { date: "15-11-2025", day: "Saturday" },
    //   { date: "16-11-2025", day: "Sunday" },
    //   { date: "17-11-2025", day: "Monday" },
    //   { date: "18-11-2025", day: "Tuesday" }
    // ]

    let betweenDates = eachDayOfInterval({
      start: startDateTime,
      end: endDateTime,
    }).map((dateInfo: Date) => ({
      date: format(dateInfo, "dd-MM-yyyy"),
      day: format(dateInfo, "EEEE"),
    }));

    // Step-2 Format the Occasion Date in Occasion Calender to [12-11-2025]
    let formatedholidays = holidays.map((holiday: Holiday) =>
      format(holiday.holidayDate, "dd-MM-yyyy")
    ) as string[];

    if (!isSandwitch) {
      // first remove the sundays
      betweenDates = betweenDates.filter((dayInfo) => dayInfo.day !== "Sunday");
      // Remove Occasion
      betweenDates = betweenDates.filter(
        (dayInfo) => !formatedholidays.includes(dayInfo.date)
      );
    }
    balance = betweenDates.length;

    balance =
      startAbsentType === AbsentType.SECOND_HALF &&
      endAbsentType === AbsentType.FIRST_HALF
        ? balance - 1
        : startAbsentType === AbsentType.SECOND_HALF
        ? balance - 0.5
        : startAbsentType === AbsentType.FULL_DAY &&
          endAbsentType === AbsentType.FIRST_HALF
        ? balance - 0.5
        : balance;
  }

  return balance;
};
