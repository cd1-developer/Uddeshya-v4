import { useSelector } from "react-redux";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { RootState } from "@/libs/store";
import { EmployeeLeaveBalance, LeaveStatus } from "@/interfaces";
import POLICIES from "@/constant/Policies";

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

  const leaves = useSelector((state: RootState) => state.dataSlice.leave);

  // ?.totalBalances as TotalBalance[];

  const currentEmployee = employees.find((emp) => emp.userId === userId);
  // const allLeaveInfo = [];

  let allLeaveInfo: {
    policyName: string;
    balance: number;
    approved: number;
    rejected: number;
    pending: number;
  }[] = [];

  POLICIES.map((policy) => {
    const leaveType = policy.policyName;
    let policyBalance =
      currentEmployee?.leaveBalances.find(
        (balance: EmployeeLeaveBalance) => balance.policyName === leaveType
      )?.balance || 0;

    let approved =
      leaves.filter(
        (leave) =>
          leave.LeaveStatus === LeaveStatus.APPROVED &&
          leave.policyName === leaveType
      ).length || 0;
    let rejected =
      leaves.filter(
        (leave) =>
          leave.LeaveStatus === LeaveStatus.REJECTED &&
          leave.policyName === leaveType
      ).length || 0;
    let pending =
      leaves.filter(
        (leave) =>
          leave.LeaveStatus === LeaveStatus.PENDING &&
          leave.policyName === leaveType
      ).length || 0;

    allLeaveInfo.push({
      policyName: leaveType,
      balance: policyBalance,
      approved,
      rejected,
      pending,
    });
  });

  return (
    <div className="w-full">
      {/* Mobile View (Cards) - Hidden on medium screens and above */}
      <div className="md:hidden space-y-4">
        {allLeaveInfo && allLeaveInfo.length > 0 ? (
          allLeaveInfo.map((balance, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              {/* Policy Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-gilSemiBold text-[1rem] text-gray-800">
                  {balance.policyName}
                </h3>
                <div className="px-3 py-1 bg-blue-50 rounded-full">
                  <span className="font-gilMedium text-sky-600 text-xs">
                    {balance.balance} Days
                  </span>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-sm font-gilMedium mb-1">
                    Approved
                  </div>
                  <div className="text-green-600 font-gilSemiBold text-xl">
                    {balance.approved}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-sm font-gilMedium mb-1">
                    Rejected
                  </div>
                  <div className="text-red-600 font-gilSemiBold text-xl">
                    {balance.rejected}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-sm font-gilMedium mb-1">
                    Pending
                  </div>
                  <div className="text-amber-600 font-gilSemiBold text-xl">
                    {balance.pending}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <img
              src="/not-found.png"
              className="w-32 h-32 mb-4 opacity-70"
              alt="No leave balance found"
            />
            <p className="font-gilMedium text-gray-500 text-lg text-center">
              No leave balance available
            </p>
            <p className="font-gilRegular text-gray-400 text-sm text-center mt-2">
              Your leave information will appear here once available
            </p>
          </div>
        )}
      </div>
      {/* Desktop View (Table) - Hidden on mobile */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {leaveBalanceHeader.map((header, i) => (
                  <TableHead
                    key={i}
                    className="text-neutral-600 font-gilSemiBold text-[1rem] py-4 px-6 first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLeaveInfo && allLeaveInfo.length > 0 ? (
                allLeaveInfo.map((balance, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4 px-6 font-gilMedium text-sm text-gray-800">
                      {balance.policyName}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                          <span className="font-gilSemiBold text-sky-600">
                            {balance.balance}
                          </span>
                          <span className="text-gray-500 font-gilRegular text-sm ml-1">
                            Days
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-gilMedium text-gray-700">
                          {balance.approved}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-gilMedium text-gray-700">
                          {balance.rejected}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="font-gilMedium text-gray-700">
                          {balance.pending}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={leaveBalanceHeader.length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src="/not-found.png"
                        className="w-36 h-36 mb-4 opacity-70"
                        alt="No leave balance found"
                      />
                      <p className="font-gilMedium text-gray-500 text-lg mb-2">
                        No leave balance available
                      </p>
                      <p className="font-gilRegular text-gray-400 text-sm">
                        Your leave information will appear here once available
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
