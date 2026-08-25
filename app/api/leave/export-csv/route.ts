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

// Admin-only export of every employee's leave balances + leaves taken in a
// given period, as a downloadable CSV.
// GET /api/leave/export-csv?userId=<adminUserId>&from=YYYY-MM-DD&to=YYYY-MM-DD

const csvCell = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  // Quote if it contains comma, quote or newline; escape inner quotes.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const fmtDate = (d?: Date | null): string =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

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

    // Period bounds (inclusive). Default: all-time if not provided.
    const from = fromStr ? new Date(fromStr) : null;
    const to = toStr ? new Date(`${toStr}T23:59:59.999Z`) : null;

    const employees = (await getEmployees()).filter(
      (e) => e.role !== Role.ADMIN,
    );

    const policyNames = POLICIES.map((p) => p.policyName);

    // Header: identity + one balance column per policy + leave detail columns.
    const header = [
      "Employee",
      "Email",
      ...policyNames.map((p) => `${p} ${ZERO_ACCRUAL.has(p) ? "Taken" : "Balance"}`),
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

      const leaves = emp.leavesApplied.filter((l) => {
        const start = new Date(l.startDateTime);
        if (from && start < from) return false;
        if (to && start > to) return false;
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
    const today = new Date().toISOString().slice(0, 10);
    const startStamp = from ? fromStr! : today;
    const endStamp = to ? toStr! : today;
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
