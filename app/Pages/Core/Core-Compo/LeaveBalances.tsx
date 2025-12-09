import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaveStatus, Employee, Role } from "@/interfaces";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface LeaveBalancesProps {
  assignMembers: Employee[];
  setAssignMembers: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const LeaveBalances = ({
  assignMembers,
  setAssignMembers,
}: LeaveBalancesProps) => {
  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case LeaveStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case LeaveStatus.REJECTED:
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  // console.log(assignMembers);
  const employeesData = assignMembers.filter((emp) => emp.role !== Role.ADMIN);

  return (
    <section className="py-2">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-2 sm:gap-0">
          <div>
            <h1 className="font-gilSemiBold text-xl sm:text-2xl text-gray-900">
              Leave Summary
            </h1>
            <p className="text-gray-500 text-sm font-gilRegular">
              Overview of team members' leave balances and status
            </p>
          </div>
          <div className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-sky-50 rounded-lg border border-sky-100">
            <User className="w-4 h-4 text-sky-600" />
            <span className="font-gilMedium text-sky-700 text-sm whitespace-nowrap">
              {employeesData.length} Employees
            </span>
          </div>
        </div>
      </header>

      <main className="">
        {employeesData && employeesData.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-sky-400" />
              </div>
              <h3 className="font-gilSemiBold text-xl text-gray-700 mb-3">
                No Team Members Found
              </h3>
              <p className="text-gray-500 mb-6">
                Add team members to view their leave information and balances.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {employeesData.map((member, index) => {
              const approvedLeaves =
                member.leavesApplied?.filter(
                  (l) => l.LeaveStatus === LeaveStatus.APPROVED
                ) || [];
              const pendingLeaves =
                member.leavesApplied?.filter(
                  (l) => l.LeaveStatus === LeaveStatus.PENDING
                ) || [];
              const rejectedLeaves =
                member.leavesApplied?.filter(
                  (l) => l.LeaveStatus === LeaveStatus.REJECTED
                ) || [];

              const totalLeaves =
                approvedLeaves.length +
                pendingLeaves.length +
                rejectedLeaves.length;

              return (
                <Card
                  key={member.id || index}
                  className="overflow-hidden border border-gray-200 hover:border-sky-200 transition-all duration-300 hover:shadow-lg"
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value={`member-${index}`}
                      className="border-none"
                    >
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-sky-50/50 transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center">
                              <span className="font-gilSemiBold text-black text-sm">
                                {member.user?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-gilSemiBold text-gray-900 text-lg text-left">
                                {member.user?.username || "Unnamed User"}
                              </h3>
                              <div className="flex items-center space-x-3 mt-1">
                                {/* <span className="text-sm text-gray-500">
                                  {member.id || "Not assigned"}
                                </span> */}
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-sm text-gray-500">
                                  {totalLeaves} Total Leaves
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-3">
                              <div className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 rounded-full">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="font-gilMedium text-emerald-700">
                                  {approvedLeaves.length}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 rounded-full">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="font-gilMedium text-amber-700">
                                  {pendingLeaves.length}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 rounded-full">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span className="font-gilMedium text-rose-700">
                                  {rejectedLeaves.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 py-6 bg-gradient-to-br from-gray-50/50 to-white">
                        <div className="space-y-8">
                          {/* Leave Balances Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="p-2 rounded-lg bg-sky-100">
                                  <FileText className="w-5 h-5 text-sky-600" />
                                </div>
                                <h4 className="font-gilSemiBold text-lg text-gray-900">
                                  Leave Balances
                                </h4>
                              </div>
                              <Badge
                                variant="outline"
                                className="font-gilMedium border-sky-200 text-sky-700"
                              >
                                Available Balance
                              </Badge>
                            </div>

                            {member.leaveBalances &&
                            member.leaveBalances.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {member.leaveBalances.map((balance) => (
                                  <Card
                                    key={balance.id}
                                    className="border border-gray-100 hover:border-sky-200 transition-colors bg-white hover:shadow-md"
                                  >
                                    <CardContent className="">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-gilMedium text-gray-800 text-sm truncate">
                                          {balance.policyName}
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-sky-500" />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-xs font-gilRegular text-gray-500">
                                            Remaining
                                          </p>
                                          <p className="font-gilSemiBold text-2xl text-sky-700">
                                            {balance.balance}
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="font-gilSemiBold border-sky-200 text-sky-700 px-3 py-1"
                                        >
                                          {balance.balance} days
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-500">
                                  No leave balances available
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Leave Status Section */}
                          <div className="border-t pt-5">
                            <h4 className="font-gilSemiBold text-lg text-gray-900 mb-3">
                              Leave Status Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                                <CardContent className="">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-emerald-100">
                                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-gilMedium">
                                      Approved
                                    </Badge>
                                  </div>
                                  <p className="font-gilSemiBold text-3xl text-emerald-700 mb-2">
                                    {approvedLeaves.length}
                                  </p>
                                  <p className="text-sm text-emerald-600">
                                    Successfully approved leave requests
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                                <CardContent className="">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-amber-100">
                                      <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-gilMedium">
                                      Pending
                                    </Badge>
                                  </div>
                                  <p className="font-gilSemiBold text-3xl text-amber-700 mb-2">
                                    {pendingLeaves.length}
                                  </p>
                                  <p className="text-sm text-amber-600">
                                    Awaiting approval decisions
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-white">
                                <CardContent className="">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-rose-100">
                                      <XCircle className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 font-gilMedium">
                                      Rejected
                                    </Badge>
                                  </div>
                                  <p className="font-gilSemiBold text-3xl text-rose-700 mb-2">
                                    {rejectedLeaves.length}
                                  </p>
                                  <p className="text-sm text-rose-600">
                                    Leave requests not approved
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </section>
  );
};

export default LeaveBalances;
