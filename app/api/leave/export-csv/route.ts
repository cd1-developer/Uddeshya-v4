import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getEmployees } from "@/helper/getEmployees";
import POLICIES from "@/constant/Policies";
import { Role } from "@/interfaces";
import { LeaveStatus } from "@prisma/client";
import {
  getLeaveDurationLabel,
  getLeaveDurationDays,
} from "@/helper/getLeaveDurationLabel";

// Policies that never accrue a balance (accrual 0). For these the "balance"
// column instead reports how many days the employee has taken.
const ZERO_ACCRUAL = new Set(
  POLICIES.filter((p) => p.accural === 0).map((p) => p.policyName),
);

// Un-Paid is the only unpaid policy; everything else counts as paid leave.
const UNPAID_POLICY = "Un-Paid Leave";

// Admin-only export of every employee's leave balances + leaves taken in a
// given period, as a downloadable CSV.
// GET /api/leave/export-csv?userId=<adminUserId>&from=YYYY-MM-DD&to=YYYY-MM-DD

const csvCell = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  // Quote if it contains comma, quote or newline; escape inner quotes.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Leave dates are stored as UTC instants but were picked as calendar days in
// IST, so render and compare them in IST. toISOString() reads them in the
// server's zone (UTC in prod) and rolls a 15 Sep leave back to 14 Sep.
// en-CA renders as YYYY-MM-DD, which also sorts as a plain string.
const IST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const fmtDate = (d?: Date | null): string => (d ? IST.format(new Date(d)) : "");

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    // Only ADMIN may export.
    const requester = await prisma.employee.findFirst({
      where: { userId },
      select: { role: true },
    });
    if (requester?.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, message: "Only admins can export leave balances" },
        { status: 403 },
      );
    }

    const employees = (await getEmployees()).filter(
      (e) => e.role !== Role.ADMIN,
    );

    const policyNames = POLICIES.map((p) => p.policyName);

    // "Paid Leaves" sits right after Exam Leave; it totals approved days from
    // every policy except Un-Paid.
    const paidInsertAt = policyNames.indexOf("Exam Leave") + 1;
    const balanceHeaders = policyNames.map(
      (p) => `${p} ${ZERO_ACCRUAL.has(p) ? "Taken" : "Balance"}`,
    );
    balanceHeaders.splice(paidInsertAt, 0, "Paid Leaves");

    // Header: identity + balance columns + leave detail columns.
    const header = [
      "Employee",
      "Email",
      ...balanceHeaders,
      "Leave Policy",
      "Start Date",
      "End Date",
      "Duration",
      "Status",
      "Reason",
    ];

    const rows: string[] = [header.map(csvCell).join(",")];

    for (const emp of employees) {
      const name = emp.user?.username ?? "";
      const email = emp.user?.email ?? "";

      // Period bounds are inclusive; YYYY-MM-DD strings compare as dates.
      const leaves = emp.leavesApplied.filter((l) => {
        const day = fmtDate(l.startDateTime);
        if (fromStr && day < fromStr) return false;
        if (toStr && day > toStr) return false;
        return true;
      });

      // Accrual policies → remaining balance. Zero-accrual policies
      // (Exam / Un-Paid) → days actually taken (approved) in this period.
      const balances = policyNames.map((p) => {
        if (ZERO_ACCRUAL.has(p)) {
          return leaves
            .filter(
              (l) =>
                l.policyName === p && l.LeaveStatus === LeaveStatus.APPROVED,
            )
            .reduce((sum, l) => sum + getLeaveDurationDays(l), 0);
        }
        return emp.leaveBalances.find((b) => b.policyName === p)?.balance ?? 0;
      });

      // Paid leaves = approved days from all policies except Un-Paid.
      const paidLeaves = leaves
        .filter(
          (l) =>
            l.LeaveStatus === LeaveStatus.APPROVED &&
            l.policyName !== UNPAID_POLICY,
        )
        .reduce((sum, l) => sum + getLeaveDurationDays(l), 0);
      balances.splice(paidInsertAt, 0, paidLeaves);

      if (leaves.length === 0) {
        // Still emit one row so the admin sees this employee's balances.
        rows.push(
          [name, email, ...balances, "", "", "", "", "", ""]
            .map(csvCell)
            .join(","),
        );
        continue;
      }

      for (const l of leaves) {
        rows.push(
          [
            name,
            email,
            ...balances,
            l.policyName,
            fmtDate(l.startDateTime),
            fmtDate(l.endDateTime),
            getLeaveDurationLabel(l),
            l.LeaveStatus,
            // Prefix the leave type so the reason column carries both.
            l.reason ? `${l.policyName}: ${l.reason}` : l.policyName,
          ]
            .map(csvCell)
            .join(","),
        );
      }
    }

    const csv = rows.join("\n");

    // Filename reflects the picked range; missing bounds fall back to today.
    const today = fmtDate(new Date());
    const startStamp = fromStr || today;
    const endStamp = toStr || today;
    const filename = `leave-balances-${startStamp}_to_${endStamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export CSV Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
};
