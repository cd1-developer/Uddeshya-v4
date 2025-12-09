import React, { useState } from "react";
import { forwardRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AbsentType, Leave, Holiday, Employee } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
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

            <Card className=" py-16 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
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
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            // src={leave.orgMember.user.username}
                            // alt={leave.orgMember.user.username}

                            src={leave.applicant?.user.username}
                            alt={leave.applicant?.user.username}
                          />
                          <AvatarFallback className="bg-blue-100 text-sky-600 font-gilSemiBold text-sm">
                            {/* {leave.orgMember.user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")} */}
                            {leave.applicant?.user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h2 className="font-gilSemiBold text-md">
                            {/* {leave.orgMember.user.username} */}
                            {leave.applicant.user.username}
                          </h2>
                          <div>
                            <div className="font-gilRegular text-sm">
                              {leave.policyName}
                            </div>
                            <p className="text-xs text-slate-500 font-gilRegular mt-2">
                              {getExactTime(leave)}
                            </p>
                            <p className="italic font-gilRegular text-[0.8rem]">
                              {/* {(leave.startAbsentType === DayType.FirstHalf ||
                                (leave.startAbsentType === DayType.SecondHalf &&
                                  leave.endAbsentType === "")) &&
                                "Half Day"} */}

                              {(leave.startAbsentType ===
                                AbsentType.FIRST_HALF ||
                                (leave.startAbsentType ===
                                  AbsentType.SECOND_HALF &&
                                  !leave.endAbsentType)) &&
                                "Half Day"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <Badge
                          className={`text-xs ${getStatusColor(
                            leave.leaveStatus
                          )}`}
                        >
                          {getStatusIcon(leave.leaveStatus)}
                          <span className="ml-1 capitalize">
                            {leave.leaveStatus}
                          </span>
                        </Badge> */}

                        <Badge
                          className={`text-xs ${getStatusColor(
                            leave.LeaveStatus
                          )}`}
                        >
                          {getStatusIcon(leave.LeaveStatus)}
                          <span className="ml-1">{leave.LeaveStatus}</span>
                        </Badge>
                      </div>
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
                            isDisabled={isPending}
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
