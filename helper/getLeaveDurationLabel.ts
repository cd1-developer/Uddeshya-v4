import { differenceInCalendarDays } from "date-fns";
import { AbsentType } from "@/interfaces";

/**
 * Single source of truth for a leave's calendar duration, shared by the
 * UI (My Leaves, Core Leave Requests) and the CSV export so they never drift.
 *
 * This is calendar duration (what the user sees), NOT the balance deduction
 * in getBalance — balance also drops Sundays/holidays for non-sandwich
 * policies, which is a different number.
 *
 * Half-day rules mirror getBalance's absent-type handling:
 *  - startAbsentType FIRST_HALF                        → 0.5 (single half day)
 *  - SECOND_HALF start + FIRST_HALF end                → days - 1
 *  - SECOND_HALF start                                 → days - 0.5
 *  - FULL_DAY start + FIRST_HALF end                   → days - 0.5
 */
interface DurationLeave {
  startDateTime: Date | string;
  endDateTime?: Date | string | null;
  startAbsentType?: string | null;
  endAbsentType?: string | null;
}

export const getLeaveDurationDays = (leave: DurationLeave): number => {
  // A first-half request is always a single half day.
  if (leave.startAbsentType === AbsentType.FIRST_HALF) return 0.5;

  const start = new Date(leave.startDateTime);
  const end = leave.endDateTime ? new Date(leave.endDateTime) : start;

  let days = differenceInCalendarDays(end, start) + 1;

  if (
    leave.startAbsentType === AbsentType.SECOND_HALF &&
    leave.endAbsentType === AbsentType.FIRST_HALF
  ) {
    days -= 1;
  } else if (leave.startAbsentType === AbsentType.SECOND_HALF) {
    days -= 0.5;
  } else if (
    leave.startAbsentType === AbsentType.FULL_DAY &&
    leave.endAbsentType === AbsentType.FIRST_HALF
  ) {
    days -= 0.5;
  }

  return days;
};

export const getLeaveDurationLabel = (leave: DurationLeave): string => {
  const days = getLeaveDurationDays(leave);
  if (days === 1) return "Full Day";
  if (days === 0.5) return "Half Day";
  return `${days} Days`;
};
