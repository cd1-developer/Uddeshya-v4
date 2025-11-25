import React, { useEffect, useState, useTransition } from "react";
import { Funnel } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { setEmployee } from "@/libs/dataslice";
import { Employee, EmployeeStatus, User } from "@/interfaces";
import { toast } from "sonner";
import ThreeBodyLoader from "@/components/custom/Loader/ThreeBodyLoader";
import { Badge } from "@/components/ui/badge";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
import { format } from "date-fns";
import { Role } from "@/interfaces";
import AssingMember from "../ReportManager/AssignMember/AssignMember";
import AssignMember from "../ReportManager/AssignMember/AssignMember";
// import AssingMember from "@/components/ReportManager/AssingMember/AssingMember";

const Current = () => {
  const dispatch = useDispatch();

  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const currentUser = useSelector(
    (state: RootState) => state.dataSlice.userInfo
  );

  const roleOfCurrentUser = employees.find(
    (member) => member.userId === currentUser?.id
  )?.role;

  const [isPending, startTransition] = useTransition();
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const updateMemberRole = async (memberId: string, newRole: string) => {
    setUpdatingMemberId(memberId);

    const previousMembers = [...employees];

    const updateMembers = employees.map((member) =>
      member.id === memberId ? { ...member, role: newRole as any } : member
    );
    dispatch(setEmployee(updateMembers));

    try {
      const response = await axios.post("/api/update-role", {
        memberId,
        newRole,
      });

      const { success, message, data } = response.data;

      if (success) {
        toast.success(message || "Role updated successfully", {
          position: "bottom-right",
          duration: 2000,
          className: "bg-green-600 text-white border border-green-500",
        });
      } else {
        throw new Error(message || "Failed to update role");
      }
    } catch (error: any) {
      dispatch(setEmployee(previousMembers));

      console.error("Error updating role: ", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Failed to update role:" + errorMessage, {
        position: "bottom-right",
        duration: 2000,
        className: "bg-red-700 text-white border border-red-600",
        style: {
          backgroundColor: "#C1292E",
          color: "white",
          border: "1px solid #3e5692",
        },
      });
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!memberId || !newRole) return;

    await updateMemberRole(memberId, newRole);
  };

  const Avatar = (name: string) => {
    const splitName = name.split(" ");
    const firstLetter = splitName.map((txt) => txt[0]).join("");
    return firstLetter;
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const getRoleVarient = (role: string) => {
      switch (role) {
        case "ADMIN":
          return "default";
        case "REPORT_MANAGER":
          return "secondary";
        case "MEMBER":
          return "outline";
        default:
          return "destructive";
      }
    };

    return (
      <Badge variant={getRoleVarient(role)} className="font-gilSemiBold">
        {role}
      </Badge>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusVarient = (status: string) => {
      switch (status) {
        case "Probation":
          return "destructive";
        case "Active":
          return "secondary";
        default:
          return "outline";
      }
    };

    return (
      <Badge variant={getStatusVarient(status)} className="font-gilSemiBold">
        {status}
      </Badge>
    );
  };

  const orgMem = useSelector((state: RootState) => state.dataSlice.employee);

  return (
    <div className="">
      <div className="flex items-center gap-4">
        <Input type="text" className="w-72" placeholder="Search all columns" />
        <Funnel className="text-neutral-500 cursor-pointer" strokeWidth={1.5} />
      </div>

      <div className=" member">
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead className="text-neutral-600 font-gilBold">
                Person
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold">
                Status
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold">
                Role
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold">
                Joining Date
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold">
                Probation End Date
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="">
            {employees.length > 0 ? (
              employees.map((member: Employee, i) => (
                <TableRow
                  key={i}
                  className={`${
                    member.role === Role.REPORT_MANAGER &&
                    roleOfCurrentUser === "ADMIN" &&
                    "cursor-pointer"
                  }`}
                  onClick={() => {
                    if (
                      roleOfCurrentUser === "ADMIN" &&
                      member.role === "REPORT_MANAGER"
                    ) {
                      setIsOpen(true);

                      setSelectedUserId(member.userId);
                    } else {
                      return;
                    }
                  }}
                >
                  <TableCell className="flex items-center gap-2 border-r">
                    <div className="font-gilSemiBold w-10 h-10 rounded-4xl bg-sky-50 flex items-center justify-center dp">
                      {Avatar(member.user?.username || "No user linked")}
                    </div>
                    <div>
                      <p className="font-gilSemiBold text-sm">
                        {member.user?.username || "No user linked"}
                      </p>
                      <p className="text-xs text-gray-500 font-gilRegular">
                        {member.user?.email || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-gilMedium border-r">
                    {<StatusBadge status={member.status} />}
                  </TableCell>
                  <TableCell className="font-gilSemiBold flex items-center gap-2 group relative border-r">
                    {/* {member.role || "—"} */}
                    {member.role === "ADMIN" ? (
                      <RoleBadge role={member.role} />
                    ) : (
                      <div className="flex items-center gap-5 ">
                        {/* <RoleBadge role={member.role} /> */}
                        {member.role === "REPORT_MANAGER" ? (
                          <div className="flex items-center gap-5 cursor-pointer">
                            <RoleBadge role={member.role} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-5">
                            <RoleBadge role={member.role} />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      {/* Only Admin can change the role of particular org member */}
                      {roleOfCurrentUser === "ADMIN" &&
                        member.role !== "ADMIN" && (
                          <div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                              <Select
                                value={member.role}
                                onValueChange={(value) =>
                                  handleRoleChange(member.id, value)
                                }
                                disabled={updatingMemberId === member.id}
                              >
                                <SelectTrigger
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer border border-[rgba(0,0,0,0.35)]"
                                ></SelectTrigger>
                                <SelectContent>
                                  <SelectGroup className="">
                                    <SelectItem value="MEMBER">
                                      MEMBER
                                    </SelectItem>
                                    <SelectItem value="REPORT_MANAGER">
                                      REPORT_MANAGER
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="font-gilMedium border-r">
                    {member.joiningDate
                      ? format(new Date(member.joiningDate), "yyyy-MM-dd")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-gilMedium border-r">
                    {member.probationEnd
                      ? format(
                          new Date(member.probationEnd.toString()),
                          "yyyy-MM-dd"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="font-gilMedium">{"—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="w-full flex flex-col items-center justify-center font-gilRegular text-gray-500 py-6"
                >
                  {/* No members found */}
                  <ThreeBodyLoader />
                  {/* <img src="/husky.gif" className="w-52 block" alt="" /> */}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DialogCompo
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        title="Assign Members"
      >
        {/* <AssingMember userId={selectedUserId as string} /> */}
        <AssignMember isOpen={setIsOpen} userId={selectedUserId as string} />
      </DialogCompo>
    </div>
  );
};

export default Current;
