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
import { format } from "date-fns";

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
        <h1 className="font-gilMedium text-[1.3rem] ">Leave Request</h1>

        <div className="create-req">
          <Button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 font-gilBold border-[1.5px] text-white bg-black border-black rounded-sm px-4 py-2 cursor-pointer"
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
                    <p className="font-gilMedium text-xl">No requests found</p>
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
      </main>
    </section>
  );
};

export default LeaveRequest;
