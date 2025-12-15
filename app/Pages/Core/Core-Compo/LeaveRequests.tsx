import React, { useState } from "react";
import { forwardRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AbsentType, Leave, Holiday, Employee } from "@/interfaces";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import AlertDialogCompo from "@/components/custom/AlertDialog/AlertDialogCompo";
import { LeaveStatus } from "@/interfaces";

import useUpdateLeaveStatus from "@/hooks/useUpdateLeaveStatus";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { Input } from "@/components/ui/input";

const getStartTime = (absentType: AbsentType) => {
  return absentType === AbsentType.FIRST_HALF
    ? "9:00 AM"
    : absentType === AbsentType.SECOND_HALF
    ? "1:00 PM"
    : "Full Day";
};

const getEndTime = (absentType: string) => {
  return absentType === "First Half" || absentType === ""
    ? "1:00 PM"
    : "Full Day";
};
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pending":
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    case "Approved":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "Rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
};
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

function getExactTime(leave: Leave) {
  let time = `${format(
    new Date(leave.startDateTime),
    "dd/MM/yyyy"
  )} ( ${getStartTime(leave.startAbsentType)} ) - ${format(
    new Date(leave.endDateTime as Date),
    "dd/MM/yyyy"
  )} ( ${getEndTime(leave.endAbsentType || "")} )`;
  return time;
}

interface LeaveRequestsProps {
  allLeaves: Leave[];
  setAllLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
  setAssignMembers: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const LeaveRequests = ({
  allLeaves,
  setAllLeaves,
  setAssignMembers,
}: LeaveRequestsProps) => {
  const [rejectedReason, setRejectedReason] = useState<string>("");
  const { isPending, updateLeaveStatus } = useUpdateLeaveStatus({
    setAllLeaves,
    setAssignMembers,
    rejectedReason,
  });

  const handleApproveLeave = (leave: Leave) => {
    updateLeaveStatus(leave, LeaveStatus.APPROVED);
  };

  const handleRejectLeave = (leave: Leave) => {
    updateLeaveStatus(leave, LeaveStatus.REJECTED);
  };

  return (
    <section className="">
      <header className="flex justify-between items-center border-b pt-2 pb-4">
        {/* <img src="" alt="" /> */}
      </header>

      <main className="mt-5 leave-data">
        <div className="space-y-5">
          {allLeaves && allLeaves.length === 0 ? (
            // <div className="flex items-center w-full bg-red-600 not-found">
            //   <img className="w-28" src="/not-found.png" alt="not-found" />
            // </div>

            <Card className="py-16 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="max-w-md mx-auto">
                {/* <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-sky-400" />
                </div> */}
                <div className="flex items-center justify-center">
                  <img src="/not-found.png" alt="not-found" className="w-28" />
                </div>
                <h3 className="font-gilSemiBold text-xl text-gray-700 mb-3">
                  No leave requests available.
                </h3>
              </CardContent>
            </Card>
          ) : (
            allLeaves.flatMap((leave, i) => (
              <div key={i}>
                <Card className="py-3">
                  <CardHeader className="pb-3 px-2 md:px-6 pt-2 md:pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12 rounded-xl border-2 border-white shadow-md bg-gradient-to-br from-slate-100 to-slate-200">
                            <AvatarImage
                              src={leave.applicant?.user.username}
                              alt={leave.applicant?.user.username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-gilSemiBold rounded-xl">
                              {leave.applicant?.user.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                            <User className="h-3 w-3 text-slate-500" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap -space-y-1 space-x-2">
                            <h2 className="font-gilSemiBold text-slate-900 text-lg">
                              {leave.applicant.user.username}
                            </h2>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700 font-gilMedium text-sm sm:text-md">
                              {leave.policyName}
                            </span>
                          </div>

                          <div className="flex items-center flex-wrap space-x-4 mt-2 sm:mt-0 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <span className="font-gilMedium text-xs">
                                {getExactTime(leave)}
                              </span>
                            </div>
                            {(leave.startAbsentType === AbsentType.FIRST_HALF ||
                              (leave.startAbsentType ===
                                AbsentType.SECOND_HALF &&
                                !leave.endAbsentType)) && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-slate-500 font-gilRegular">
                                  Half Day
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={` 
                          "px-3 py-1.5 rounded-lg font-medium border shadow-sm",
                          ${getStatusColor(leave.LeaveStatus)}
                        `}
                      >
                        <div className="flex items-center space-x-1.5">
                          {getStatusIcon(leave.LeaveStatus)}
                          <span>{leave.LeaveStatus}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">
                          <span className="font-gilBold">Reason:</span>{" "}
                          <span className="font-gilRegular">
                            {leave.reason}
                          </span>
                        </p>
                      </div>

                      {leave.LeaveStatus === LeaveStatus.PENDING && (
                        <div className="flex space-x-2 pt-2">
                          <AlertDialogCompo
                            triggerButton={<ApproveButton />}
                            isDisabled={isPending}
                            isLoading={isPending}
                            onClickHandler={() => handleApproveLeave(leave)}
                            description={
                              <Description title={leave.policyName} />
                            }
                            actionTitle="Approve Leave"
                            loader="Approving..."
                          />
                          {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(true)}
                            className="border-red-200 text-red-600 hover:bg-red-50 font-gilRegular"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button> */}
                          <AlertDialogCompo
                            triggerButton={<RejectButton />}
                            isDisabled={!rejectedReason.trim()}
                            isLoading={isPending}
                            onClickHandler={() => handleRejectLeave(leave)}
                            description={
                              <Description title={leave.policyName} />
                            }
                            actionTitle="Reject Leave"
                            loader="Rejecting..."
                          >
                            <Input
                              placeholder="Enter the reason of rejection"
                              value={rejectedReason}
                              onChange={(e) =>
                                setRejectedReason(e.target.value)
                              }
                              className="mt-3"
                              required
                            />
                          </AlertDialogCompo>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </main>
    </section>
  );
};

export default LeaveRequests;

const Description = ({ title }: { title: string }) => {
  return (
    <>
      You are about to approve a{" "}
      <span className="font-gilSemiBold text-black">{title}</span> request. Once
      approved, this update will reflect immediately for the member.
    </>
  );
};

const ApproveButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <Button
    size="sm"
    ref={ref}
    {...props}
    className="bg-sky-600 hover:bg-sky-700 text-white font-gilRegular"
  >
    <CheckCircle className="h-4 w-4 mr-1" />
    <span>Approve</span>
  </Button>
));

const RejectButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <Button
    size="sm"
    ref={ref}
    {...props}
    className="border-red-200 text-red-600 bg-white hover:bg-red-50 font-gilRegular"
  >
    <XCircle className="h-4 w-4 mr-1" />

    <span>Reject</span>
  </Button>
));
