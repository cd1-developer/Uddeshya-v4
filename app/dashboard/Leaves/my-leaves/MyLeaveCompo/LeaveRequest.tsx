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
  // const reportManagerId = useSelector(
  //   (state: RootState) => state.dataSlice.userInfo.employee?.reportManagerId
  // );
  const reportManagerId = employee?.reportManagerId;

  // console.log(reportManagerId);
  //   const { orgMembers, orgMemberId, reportManagerId, loading } = useSelector(
  //     (state: RootState) => ({
  //       orgMembers: state.dataSlice.organisationMember,
  //       orgMemberId: state.dataSlice.userInfo.orgMember?.id,
  //       reportManagerId: state.dataSlice.userInfo.orgMember?.reportManagerId,
  //       loading: state.dataSlice.isLoading,
  //     })
  //   );

  const dispatch = useDispatch();

  // const adminId = orgMembers.find((memeber) => memeber.role === "ADMIN")?.id;
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

        <div className="sm:hidden space-y-4 mt-3">
          {leaveData && leaveData.length === 0 ? (
            <div>
              <div className="flex flex-col items-center justify-center">
                <img
                  src="/not-found.png"
                  alt="image not found"
                  className="w-18 h-18"
                />
                <p className="font-gilMedium text-xl">No requests found</p>
                <p className="text-gray-500 font-gilLight text-sm">
                  Couldn't find any requests
                </p>
              </div>
            </div>
          ) : (
            leaveData.map((leave, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border space-y-1 border-gray-100"
              >
                <div>
                  <div className="font-gilSemiBold px-5 py-3 text-[1.1rem] border-b policy-name">
                    {leave.policyName}
                  </div>
                  <div className="date-days space-y-1 px-5 py-1">
                    <div className="relative group w-fit">
                      <div className="font-gilRegular cursor-pointer text-sm">
                        {format(new Date(leave.startDateTime), "dd MMM")} {"-"}{" "}
                        {format(new Date(leave.endDateTime as Date), "dd MMM")}
                      </div>
                      <span className="bg-slate-50 border border-slate-200 text-slate-800 font-gilRegular text-xs px-3 py-1 rounded-full opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left pointer-events-none absolute whitespace-nowrap bottom-1 left-28">
                        Start Date & End Date
                      </span>
                    </div>

                    <div className="bg-slate-100 font-gilRegular text-xs inline-block px-5 py-1 border rounded-2xl">
                      {differenceInDays(
                        new Date(leave.endDateTime as Date),
                        new Date(leave.startDateTime)
                      ) +
                        1 ===
                      1
                        ? differenceInDays(
                            new Date(leave.endDateTime as Date),
                            new Date(leave.startDateTime)
                          ) +
                          1 +
                          " Day"
                        : differenceInDays(
                            new Date(leave.endDateTime as Date),
                            new Date(leave.startDateTime)
                          ) +
                          1 +
                          " Days"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row-reverse items-end justify-between mt-5 px-5 pb-3">
                  <div className="border border-sky-200 px-4 inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 text-sm font-gilMedium rounded-full py-3">
                    {leave.LeaveStatus}
                    <ChevronRight size={17} />
                  </div>
                  <div className="font-gilRegular text-sm">{leave.reason}</div>
                </div>
              </div>
            ))
          )}
        </div>
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
