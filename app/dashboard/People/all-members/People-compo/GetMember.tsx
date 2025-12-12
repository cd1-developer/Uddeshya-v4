import React, { useEffect, useMemo, useState, useTransition } from "react";
import { styled, keyframes, setup } from "goober";
import { Funnel, ChevronRight } from "lucide-react";
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
import { Employee, LeaveStatus } from "@/interfaces";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
import { format } from "date-fns";
import { Role } from "@/interfaces";
import AssignMember from "../ReportManager/AssignMember/AssignMembers";

// import AssingMember from "@/components/ReportManager/AssingMember/AssingMember";

interface BulkTransitionData {
  bulkData: any[];
  bulkColumns: string[];
}
setup(React.createElement);
const Current = ({ bulkData, bulkColumns }: BulkTransitionData) => {
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const currentUser = useSelector(
    (state: RootState) => state.dataSlice.userInfo
  );

  const roleOfCurrentUser = employees.find(
    (member) => member.userId === currentUser?.id
  )?.role;

  const updateMemberRole = async (memberId: string, newRole: string) => {
    setUpdatingMemberId(memberId);
    const selectedEmployee = employees.find(
      (emp: Employee) => emp.id === memberId
    );

    const previousMembers = [...employees];

    let updateMembers = employees.map((member: Employee) =>
      member.id === memberId
        ? {
            ...member,
            role: newRole as any,
            // Remove the assign member from the reportManager
            // unassing the all the PENDING leaves applied by the assign members
            ...(member.role === Role.REPORT_MANAGER &&
              newRole !== Role.REPORT_MANAGER && {
                assignMembers: [],
                leavesActioned: member.leavesActioned?.filter(
                  (leave) => leave.LeaveStatus !== LeaveStatus.PENDING
                ),
              }),
          }
        : member
    );
    // Remove the reportManager from the assing Members
    if (
      selectedEmployee?.role === Role.REPORT_MANAGER &&
      newRole !== Role.REPORT_MANAGER
    ) {
      updateMembers = updateMembers.map((member: Employee) => {
        if (member.reportManagerId === memberId) {
          return {
            ...member,
            reportManagerId: null,
            reportManager: null,
          };
        }
        return member;
      });
    }

    try {
      const response = await axios.patch(
        `/api/Employee/update-role?employeeId=${memberId}`,
        {
          role: newRole,
        }
      );

      const { success, message, data } = response.data;

      if (success) {
        dispatch(setEmployee(updateMembers));
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
    const firstLetter = splitName
      .map((txt) => txt[0])
      .join("")
      .toUpperCase();
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
      <Badge
        variant={getRoleVarient(role)}
        className="font-gilMedium text-xs px-4 py-1"
      >
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
      <Badge
        variant={getStatusVarient(status)}
        className="font-gilMedium text-[0.65rem]"
      >
        {status}
      </Badge>
    );
  };

  const filterEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const match =
        emp.user.username.toLowerCase().includes(input.toLowerCase()) ||
        emp.user.email.toLowerCase().includes(input.toLowerCase()) ||
        emp.role.toLowerCase().includes(input.toLowerCase());

      return match;
    });
  }, [input, employees]);

  return (
    <div className="">
      <div className="flex items-center gap-4">
        <Input
          type="text"
          className="w-72 font-gilRegular text-xs pb-0"
          placeholder="Search all columns"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Funnel
          className="text-neutral-500 cursor-pointer size-5 sm:size-6"
          strokeWidth={1.5}
        />
      </div>
      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4 mt-6">
        {filterEmployees.length > 0 ? (
          filterEmployees.map((member: Employee, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
                member.role === Role.REPORT_MANAGER &&
                roleOfCurrentUser === Role.ADMIN
                  ? "cursor-pointer border-l-4 border-l-blue-500"
                  : ""
              }`}
              onClick={() => {
                if (
                  roleOfCurrentUser === Role.ADMIN &&
                  member.role === Role.REPORT_MANAGER
                ) {
                  setIsOpen(true);
                  setSelectedUserId(member.userId);
                }
              }}
            >
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="font-gilSemiBold text-blue-700 text-sm">
                      {Avatar(member.user?.username || "N/A")}
                    </span>
                  </div>
                  {member.role === Role.ADMIN && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">A</span>
                    </div>
                  )}
                  {member.role === Role.REPORT_MANAGER && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">R</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-gilSemiBold text-base text-gray-900 truncate">
                      {member.user?.username || "No user linked"}
                    </h3>
                    <StatusBadge status={member.status} />
                  </div>
                  <p className="font-gilLight text-xs text-gray-500 truncate mb-2">
                    {member.user?.email || "No email"}
                  </p>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={member.role} />
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-gilRegular text-xs text-gray-500">
                      Joining
                    </span>
                  </div>
                  <p className="font-gilMedium text-sm text-gray-900">
                    {member.joiningDate
                      ? format(new Date(member.joiningDate), "dd MMM, yyyy")
                      : "-"}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    member.probationEnd &&
                    new Date(member.probationEnd.toString()) < new Date()
                      ? "bg-green-50"
                      : "bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className={`w-4 h-4 ${
                        member.probationEnd &&
                        new Date(member.probationEnd.toString()) < new Date()
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={`font-gilRegular text-xs ${
                        member.probationEnd &&
                        new Date(member.probationEnd.toString()) < new Date()
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      Probation
                    </span>
                  </div>
                  <p
                    className={`font-gilMedium text-sm ${
                      member.probationEnd &&
                      new Date(member.probationEnd.toString()) < new Date()
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    {member.probationEnd ? (
                      new Date(member.probationEnd.toString()) < new Date() ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Completed
                        </span>
                      ) : (
                        format(
                          new Date(member.probationEnd.toString()),
                          "dd MMM, yyyy"
                        )
                      )
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex-1">
                  {/* Role Change for Admin */}
                  {roleOfCurrentUser === "ADMIN" && member.role !== "ADMIN" && (
                    <div className="relative">
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleRoleChange(member.id, value)
                        }
                        disabled={updatingMemberId === member.id}
                      >
                        <SelectTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="w-full cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-gilMedium text-sm text-gray-700">
                              Change Role
                            </span>
                            {/* <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg> */}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              value="MEMBER"
                              className="font-gilMedium text-sm hover:bg-blue-50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                Member
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="REPORT_MANAGER"
                              className="font-gilMedium text-sm hover:bg-blue-50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                Report Manager
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Assign Button for Report Managers */}
                {roleOfCurrentUser === Role.ADMIN &&
                  member.role === Role.REPORT_MANAGER && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                        setSelectedUserId(member.userId);
                      }}
                      className="ml-3 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-gilMedium text-sm rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Assign
                    </button>
                  )}
              </div>

              {/* Status Indicator */}
              {member.role === Role.REPORT_MANAGER &&
                roleOfCurrentUser === Role.ADMIN && (
                  <div className="mt-3 flex items-center justify-end">
                    <div className="flex items-center gap-1 text-sky-600 text-xs font-gilMedium">
                      <span>Click to assign members</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-gilSemiBold text-lg text-gray-800 mb-2">
              No employees found
            </h3>
            <p className="font-gilLight text-gray-500 text-sm">
              {input
                ? "Try adjusting your search"
                : "Start by adding team members"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block member mt-5">
        <Table className="border-t border-l border-b">
          <TableHeader className="">
            <TableRow>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Avatar
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Person
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Status
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Role
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Joining Date
              </TableHead>
              <TableHead className="text-neutral-600 font-gilBold border-r">
                Probation End Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filterEmployees.length > 0 ? (
              filterEmployees.map((member: Employee, i) => (
                <TableRow
                  key={i}
                  className={`${
                    member.role === Role.REPORT_MANAGER &&
                    roleOfCurrentUser === Role.ADMIN &&
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
                  <TableCell className="border-r">
                    <div className="font-gilSemiBold w-10 h-10 rounded-4xl bg-sky-50 flex items-center justify-center dp">
                      {Avatar(member.user?.username || "No user linked")}
                    </div>
                  </TableCell>
                  <TableCell className="border-r">
                    <div>
                      <p className="font-gilSemiBold text-sm">
                        {member.user?.username || "No user linked"}
                      </p>
                      <p className="text-xs text-gray-500 font-gilRegular">
                        {member.user?.email || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="border-r">
                    {<StatusBadge status={member.status} />}
                  </TableCell>
                  <TableCell className="border-r flex items-center gap-6">
                    {member.role === Role.ADMIN ? (
                      <RoleBadge role={member.role} />
                    ) : (
                      <div className="flex items-center gap-5 ">
                        {/* <RoleBadge role={member.role} /> */}
                        {member.role === Role.REPORT_MANAGER ? (
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
                            <div className="group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                              <Select
                                value={member.role}
                                onValueChange={(value) =>
                                  handleRoleChange(member.id, value)
                                }
                                disabled={updatingMemberId === member.id}
                              >
                                <SelectTrigger
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer border border-[rgba(0,0,0,0.05)]"
                                >
                                  {/* <SelectValue placeholder="Choose the role" /> */}
                                </SelectTrigger>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center font-gilRegular text-lg text-gray-500 py-6"
                >
                  No members found
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
