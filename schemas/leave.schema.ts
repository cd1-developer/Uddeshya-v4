import z from "zod";
import { AbsentType } from "@/interfaces";

export const LeaveSchema = z.object({
  employeeId: z.string({ error: "Employee Id is required" }),
  policyName: z.string({ error: "Policy name is required" }),
  startDateTime: z.date({ error: "Start Date is required" }),
  startAbsentType: z.enum(AbsentType, { error: "Absent type is required" }),
  endDateTime: z
    .date({ error: "End Date should be in date format" })
    .optional(),
  endAbsentType: z
    .enum([AbsentType.FULL_DAY, AbsentType.FIRST_HALF], {
      error: "Absent type is required",
    })
    .optional(),
  reason: z.string({ error: "Reason is required" }),
  actionByEmployeeId: z.string({ error: "Action by employee id is required" }),
});
