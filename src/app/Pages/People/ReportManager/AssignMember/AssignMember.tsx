// import {
//   OrganisationMember,
//   ReportManager,
//   setOrganisationMember,
//   setReportManager,
// } from "@/libs/Dataslice";
import { Employee, Role } from "@/interfaces";
import { setEmployee } from "@/libs/dataslice";
import { RootState } from "@/libs/store";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, UserPlus, Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";
import { stat } from "fs";
interface AssingMemberProps {
  userId: string;
}

function AssignMember({ userId }: AssingMemberProps) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedOrgMember, setSelectedOrgMember] = useState<Employee[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const allEmployee = useSelector(
    (state: RootState) => state.dataSlice.employee
  );

  const reportManager = useSelector(
    (state: RootState) => state.dataSlice.employee
  ).filter((employee) => employee.role === Role.REPORT_MANAGER);

  const selectedReportManager = allEmployee.find(
    (employee) => employee.userId === userId
  );

  console.log(allEmployee);
  // Selected Report Manager based on the list

  // The userId of selected ReportManager -> Report Manager
  // Ex: If Selected Report Manager is Himanshu and the report manager of Himanshu is Akash
  // then selectedReportMangersManagerUserId hold the userId Akash.

  //todo -------->   main
  //   const selectedReportMangersManagerUserId = reportManagers.find(
  //     (manager) =>
  //       manager.id ===
  //       allOrgMembers.find(
  //         (member) => member.userId === selectedReportManager.userId
  //       )?.reportManagerId
  //   )?.userId as string;
  //todo --------->   main

  // 🔹 Determine the list of unassigned organisation members based on the following rules:
  // 1️⃣ Include only members who currently have no assigned report manager.
  // 2️⃣ Exclude members whose role is "ADMIN".
  // 3️⃣ Exclude members who are already assigned to a report manager.
  // 4️⃣ Exclude the selected Report Manager themselves.
  // 5️⃣ Exclude the manager of the selected Report Manager.
  //     Example: If the selected Report Manager is Himanshu and his manager is Akash,
  //     then Akash should not appear in the list of unassigned members

  //todo ---------->   main
  //   const unassignedMembers = useMemo(
  //     () =>
  //       allEmployee.filter(
  //         (member) =>
  //           !member.reportManagerId &&
  //           member.role !== "ADMIN" &&
  //           !selectedOrgMember.some((mem) => mem.id === member.id) &&
  //           member.userId !== userId &&
  //           member.userId !== selectedReportMangersManagerUserId
  //       ),
  //     [allEmployee, selectedOrgMember, userId]
  //   );
  //todo ---------->   main

  // Filtering orgMembers based on searched OrgMember

  //todo ---------->   main
  //   const filteredUnassignedMembers = useMemo(() => {
  //     if (!input) return unassignedMembers;
  //     return unassignedMembers.filter((member) =>
  //       member.user.username.toLowerCase().includes(input.toLowerCase())
  //     );
  //   }, [input, unassignedMembers]);
  //todo ---------->   main

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Assign selected organisation members under a specific report manager
  function assignMember() {
    startTransition(async () => {
      try {
        // 🟩 Step 1: Send API request to assign members to the selected Report Manager
        const res = await axios.post("/api/ReportManager/assign-member", {
          //   selectedOrgMembers: selectedOrgMember as OrganisationMember[],
          //   selectedReportManagerId: selectedReportManager.id as string,
        });

        const { success, message } = res.data;

        // 🟨 Step 2: Handle API failure — show error notification
        if (!success) {
          toast.error(message, {
            position: "bottom-right",
            duration: 3000,
            className: "bg-red-700 text-white border border-red-600",
            style: {
              backgroundColor: "#C1292E",
              color: "white",
              border: "1px solid #3E5692",
            },
          });
          return; // Exit early if assignment failed
        }

        // 🟦 Step 3: Update the Report Managers state — add assigned members to the selected manager
        //todo ---------->   main
        // const updatedReportManagers = reportManagers.map((manager) =>
        //   manager.id === selectedReportManager?.id
        //     ? {
        //         ...manager,
        //         orgMembers: [...manager.orgMembers, ...selectedOrgMember],
        //       }
        //     : manager
        // );
        //todo ---------->   main

        // 🟦 Step 4: Update Organisation Members state — set reportManagerId for assigned members
        //todo ---------->   main
        // const updatedOrgMembers = allOrgMembers.map((member) =>
        //   selectedOrgMember.some((mem) => mem.id === member.id)
        //     ? {
        //         ...member,
        //         reportManagerId: selectedReportManager?.id as string,
        //       }
        //     : member
        // );
        //todo ---------->   main

        // 🟩 Step 5: Dispatch updated data to the Redux store

        //todo ---------->   main
        // dispatch(setOrganisationMember(updatedOrgMembers));
        // dispatch(setReportManager(updatedReportManagers));
        //todo ---------->   main

        setSelectedOrgMember([]);
      } catch (error: any) {
        // 🟥 Step 6: Handle unexpected errors gracefully
        console.error("Error assigning members:", error);
        toast.error("Something went wrong while assigning members.", {
          position: "bottom-right",
          duration: 3000,
          className: "bg-red-700 text-white border border-red-600",
        });
      }
    });
  }
  // 🔹 Remove (unassign) an organisation member from a Report Manager
  async function removeOrgMember(memberId: string) {
    try {
      // 🟩 Step 1: Send API request to unassign the organisation member
      const res = await axios.post("/api/ReportManager/unassign-member", {
        selectedOrgMemberId: memberId,
      });

      const { success, message } = res.data;

      // 🟨 Step 2: Handle API failure — show error notification
      if (!success) {
        toast.error(message, {
          position: "bottom-right",
          duration: 3000,
          className: "bg-red-700 text-white border border-red-600",
          style: {
            backgroundColor: "#C1292E",
            color: "white",
            border: "1px solid #3E5692",
          },
        });
        return; // Exit early if unassignment failed
      }

      // 🟦 Step 3: Update the Report Managers state — remove the unassigned member
      //todo ---------->   main
      //   const updatedReportManagers = reportManagers.map((manager) =>
      //     manager.id === selectedReportManager?.id
      //       ? {
      //           ...manager,
      //           orgMembers: manager.orgMembers.filter(
      //             (member) => member.id !== memberId
      //           ),
      //         }
      //       : manager
      //   );
      //todo ---------->   main

      // 🟦 Step 4: Update Organisation Members state — set reportManagerId to null for the unassigned member
      const updatedOrgMembers = allOrgMembers.map((member) =>
        member.id === memberId ? { ...member, reportManagerId: null } : member
      );

      // 🟩 Step 5: Dispatch updated data to Redux store
      //todo ---------->   main
      //   dispatch(setOrganisationMember(updatedOrgMembers));
      //   dispatch(setReportManager(updatedReportManagers));
      //todo ---------->   main
    } catch (error: any) {
      // 🟥 Step 6: Handle unexpected errors gracefully
      console.error("Error unassigning member:", error);
      toast.error("Something went wrong while unassigning the member.", {
        position: "bottom-right",
        duration: 3000,
        className: "bg-red-700 text-white border border-red-600",
      });
    }
  }

  return (
    <div className="fixed top-5 left-3 w-full">
      <div className="flex justify-center flex-col w-full">
        {/* Header */}
        <h2 className="text-2xl font-gilSemiBold text-gray-900 mb-2">
          Assign Members
        </h2>
        <p className="text-gray-600 font-gilRegular mb-5">
          Assign team members to report to{" "}
          <span className="font-gilSemiBold text-gray-900">
            {selectedReportManager?.user.username || "Selected Manager"}
          </span>
        </p>

        {/* Search Input */}
        <div ref={searchContainerRef} className="relative">
          <div className="w-[92%] flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 transition-all bg-gray-50">
            <UserPlus size={18} className="text-gray-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search and add people..."
              className="w-full bg-transparent font-gilRegular outline-none placeholder:text-gray-400 placeholder:font-gilThin"
            />
          </div>

          {/* Selected Members */}
          {selectedOrgMember.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedOrgMember.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm  transition-all duration-200 cursor-pointer hover:scale-95 "
                >
                  <span>{member.user.username}</span>
                  <button
                    onClick={() =>
                      setSelectedOrgMember((prev) =>
                        prev.filter((mem) => mem.id !== member.id)
                      )
                    }
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropdown */}
          {/* {isFocused && (
            <div className="absolute w-[92%] top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {filteredUnassignedMembers.length > 0 ? (
                filteredUnassignedMembers.map((member) => (
                  <div
                    key={member.userId}
                    onClick={() => {
                      setSelectedOrgMember([...selectedOrgMember, member]);
                      setInput("");
                      setIsFocused(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {String(member.user.username.trim()[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {member.user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500 text-sm">
                  No members found
                </p>
              )}
            </div>
          )} */}
        </div>

        {/* Assigned Members List */}
        <div className="mt-8">
          {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {selectedReportManager?.orgMembers.length === 0
              ? "No members assigned yet"
              : "People reporting to this manager"}
          </h3> */}
          <ScrollArea className="h-80 w-[92%] md:w-[96%]">
            <div className="space-y-3 px-2 sm:px-3 md:px-4 py-2"></div>
          </ScrollArea>
        </div>
      </div>
      {selectedOrgMember.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-lg px-5 py-2 cursor-pointer
                 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={assignMember}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Assigning...</span>
              </>
            ) : (
              <>
                {/* 👤 Normal button state */}
                <UserPlus size={18} className="text-white" />
                <span>Assign Member</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default AssignMember;
