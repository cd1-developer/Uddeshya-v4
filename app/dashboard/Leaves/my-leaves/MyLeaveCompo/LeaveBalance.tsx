import React, { useId } from "react";
import { PencilLine } from "lucide-react";
import { useSelector } from "react-redux";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { RootState } from "@/libs/store";
import { EmployeeLeaveBalance, LeaveStatus } from "@/interfaces";
import { all } from "axios";
// import { TotalBalance } from "@/libs/Dataslice";

const leaveBalanceHeader = [
  "Leave Type",
  "Leave Balance",
  "Approved",
  "Rejected",
  "Pending",
  // "Leaves Pending Approval",
];

const LeaveBalance = () => {
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const userId = useSelector((state: RootState) => state.dataSlice.userInfo.id);

  const totalBalance = employees.find((emp) => emp.userId === userId)
    ?.leaveBalances as EmployeeLeaveBalance[];
  // ?.totalBalances as TotalBalance[];

  const currentEmployeeLeaveBalance = employees.find(
    (emp) => emp.userId === userId
  );
  // const allLeaveInfo = [];

  let allLeaveInfo: {
    policyName: string;
    balance: number;
    approved: number;
    rejected: number;
    pending: number;
  }[] = [];

  if (
    currentEmployeeLeaveBalance &&
    currentEmployeeLeaveBalance.leaveBalances
  ) {
    currentEmployeeLeaveBalance.leaveBalances.forEach((item) => {
      const leaveType = item.policyName;
      // console.log(type);
      // filter leaves based on type
      const approved =
        currentEmployeeLeaveBalance.leavesApplied?.filter(
          (lv) =>
            lv.policyName === leaveType &&
            lv.LeaveStatus === LeaveStatus.APPROVED
        ).length || 0;

      const rejected =
        currentEmployeeLeaveBalance.leavesApplied?.filter(
          (lv) =>
            lv.policyName === leaveType &&
            lv.LeaveStatus === LeaveStatus.REJECTED
        ).length || 0;

      const pending =
        currentEmployeeLeaveBalance.leavesApplied?.filter(
          (lv) =>
            lv.policyName === leaveType &&
            lv.LeaveStatus === LeaveStatus.PENDING
        ).length || 0;

      allLeaveInfo.push({
        policyName: leaveType,
        balance: item.balance,
        approved,
        rejected,
        pending,
      });
    });
  }
  console.log(allLeaveInfo);

  // const orgMember = useSelector(
  //   (state: RootState) => state.dataSlice.organisationMember
  // );
  // const leaveType = useSelector(
  //   (state: RootState) => state.dataSlice.leaveTypes
  // );

  return (
    <div>
      <div className="total-balance">
        <Table>
          {/* <TableCaption>Your Leave Balance</TableCaption> */}

          <TableHeader>
            <TableRow>
              {leaveBalanceHeader.map((header, i) => (
                <TableHead
                  key={i}
                  className="text-neutral-600 font-gilSemiBold text-[1rem]"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {allLeaveInfo && allLeaveInfo.length > 0 ? (
              allLeaveInfo.map((balance, i) => (
                <TableRow key={i}>
                  <TableCell className="font-gilMedium">
                    {balance.policyName}
                  </TableCell>
                  <TableCell className="font-gilMedium flex items-center gap-5">
                    <div>
                      {balance.balance} <span>Days</span>
                    </div>
                    {/* <div>
                      <PencilLine
                        strokeWidth={2}
                        className="text-sky-600 cursor-pointer"
                        size={13}
                      />
                    </div> */}
                  </TableCell>
                  <TableCell>{balance.approved}</TableCell>
                  <TableCell>{balance.rejected}</TableCell>
                  <TableCell>{balance.pending}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow aria-colspan={leaveBalanceHeader.length}>
                <TableCell
                  colSpan={leaveBalanceHeader.length}
                  className="text-gray-500 py-6"
                >
                  <div className="flex flex-col items-center justify-center font-gilRegular text-lg">
                    {/* <img src="/not-found.png" className="w-28 h-28" alt="" /> */}
                    <img src="/husky.gif" className="w-28 h-48" alt="Goku" />
                    No leave balance available
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaveBalance;
