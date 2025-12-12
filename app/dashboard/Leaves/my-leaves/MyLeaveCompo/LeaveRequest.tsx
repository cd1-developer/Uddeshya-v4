import { useState } from "react";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
import { Button } from "@/components/ui/button";
import LeaveRequestForm from "./LeaveRequestForm";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeaveSchema } from "@/schemas/leave.schema";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { differenceInDays } from "date-fns";

import { AbsentType, Employee, LeaveStatus, Role } from "@/interfaces";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { ChevronRight } from "lucide-react";

type CreateLeaveFormValues = z.infer<typeof LeaveSchema>;

const LeaveRequest = () => {
  const leaveData = useSelector((state: RootState) => state.dataSlice.leave);
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const currentUserId = useSelector(
    (state: RootState) => state.dataSlice.userInfo.id
  );

  const employee = employees.find(
    (emp) => emp.userId === currentUserId
  ) as Employee;

  const reportManagerId = employee?.reportManagerId;

  const adminId = employees.find((emp) => emp.role === Role.ADMIN)?.id;

  const form = useForm<CreateLeaveFormValues>({
    resolver: zodResolver(LeaveSchema),
    mode: "onBlur",
    defaultValues: {
      employeeId: employee?.id as string,
      policyName: "",
      startDateTime: undefined,
      endDateTime: undefined,
      startAbsentType: AbsentType.FIRST_HALF, // Add this
      endAbsentType: undefined,
      reason: "",
      actionByEmployeeId: reportManagerId || adminId, // Those who does not have reportManager
      // then their leave request is handel my Admin
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const selectItems = [
    {
      value: "Pending",
    },
    {
      value: "Approved",
    },
    {
      value: "Rejected",
    },
  ];
  const statusVariant = {
    Approved: "default",
    Rejected: "destructive",
    Pending: "secondary",
  };

  return (
    <section className="">
      <header className="flex justify-between items-center border-b pt-2 pb-4">
        <h1 className="font-gilSemiBold text-xl md:text-2xl">Leave Request</h1>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
        <div className="create-req">
          <Button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 font-gilBold text-xs border-[1.5px] text-white bg-black border-black rounded-sm cursor-pointer"
          >
            Create Request
          </Button>
          <DialogCompo
            isOpen={isOpen}
            onOpenChange={() => {
              setIsOpen(false);
              form.reset();
            }}
            title="Create Leave Request"
            className="max-w-2xl"
          >
            <LeaveRequestForm form={form} setIsOpen={setIsOpen} />
          </DialogCompo>
        </div>
      </header>
      <main className="mt-5 leave-data">
        <div className="filter">
          <Select>
            <SelectTrigger className="w-52 font-gilMedium">
              <SelectValue placeholder="Leave Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {/* <SelectItem></SelectItem> */}
                {selectItems.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="font-gilMedium text-md "
                  >
                    {item.value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
        <div className="sm:hidden space-y-3 mt-3">
          {!leaveData || leaveData.length === 0 ? (
            <div className="text-center py-10 px-4">
              <img
                src="/not-found.png"
                alt="No requests"
                className="w-16 h-16 mx-auto mb-3 opacity-70"
              />
              <p className="font-gilMedium text-gray-700 mb-1">
                No leave requests
              </p>
              <p className="text-gray-500 text-sm">
                Start by creating a request
              </p>
            </div>
          ) : (
            leaveData.map((leave, i) => (
              <div
                key={leave.id || i}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                {/* Top Row: Policy + Status */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-gilSemiBold text-gray-800 text-sm">
                    {leave.policyName}
                  </h3>
                  <span
                    className={`text-xs font-gilMedium px-2 py-1 rounded-full ${
                      leave.LeaveStatus === LeaveStatus.APPROVED
                        ? "bg-green-100 text-green-800"
                        : leave.LeaveStatus === LeaveStatus.REJECTED
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {leave.LeaveStatus}
                  </span>
                </div>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
                {/* Middle Row: Dates */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-gilMedium text-gray-700">
                      {format(new Date(leave.startDateTime), "MMM dd")} -{" "}
                      {format(new Date(leave.endDateTime as Date), "MMM dd")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {differenceInDays(
                        new Date(leave.endDateTime as Date),
                        new Date(leave.startDateTime)
                      ) + 1}{" "}
                      days
                    </div>
                  </div>
                </div>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
                {/* Reason (Shortened) */}
                <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {leave.reason}
                </div>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
                {/* Bottom Row: Absent Type */}
                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span className="font-gilMedium">
                    {leave.startAbsentType === AbsentType.FIRST_HALF
                      ? "First Half"
                      : leave.startAbsentType === AbsentType.SECOND_HALF
                      ? "Second Half"
                      : "Full Day"}
                  </span>
                  <span>
                    {format(new Date(leave.startDateTime), "dd/MM/yy")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-gilRegular">Policy Name</th>
                <th className="text-left p-3 font-gilRegular">Start Date</th>
                <th className="text-left p-3 font-gilRegular">End Date</th>
                <th className="text-left p-3 font-gilRegular">Reason</th>
                <th className="text-left p-3 font-gilRegular">Status</th>
              </tr>
            </thead>
<<<<<<< HEAD

=======
>>>>>>> d1490de3a4e9bc796b57f92a06b44eaa92a368c8
            <tbody>
              {leaveData && leaveData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src="/not-found.png"
                        alt="image not found"
                        className="w-28 h-28"
                      />
                      <p className="font-gilMedium text-xl">
                        No requests found
                      </p>
                      <p className="text-gray-500 font-gilLight text-sm">
                        Couldn't find any requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaveData.map((leave, i) => (
                  <tr className="border-b hover:bg-gray-50" key={i}>
                    <td className="p-3 font-gilLight">{leave.policyName}</td>
                    <td className="p-3 font-gilLight">
                      {format(new Date(leave.startDateTime), "dd/MM/yyyy")}
                    </td>
                    <td className="p-3 font-gilLight">
                      {new Date(leave.endDateTime as Date).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-gilLight">{leave.reason}</td>
                    <td className="p-3 font-gilLight">
                      <Badge
                        variant={
                          leave.LeaveStatus === LeaveStatus.APPROVED
                            ? "outline"
                            : leave.LeaveStatus === LeaveStatus.REJECTED
                            ? "destructive"
                            : "default"
                        }
                        className={`px-2 py-1 rounded-full text-xs font-gilMedium`}
                      >
                        {leave.LeaveStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </section>
  );
};

export default LeaveRequest;
