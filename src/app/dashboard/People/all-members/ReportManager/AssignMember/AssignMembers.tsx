import { Employee, Role } from "@/interfaces";
import { setEmployee } from "@/libs/dataslice";
import { RootState } from "@/libs/store";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useTransition,
  memo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { successToast } from "@/components/custom/SuccessToast";
import { SelectIcon } from "@radix-ui/react-select";
interface AssingMemberProps {
  userId: string;
  isOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function AssignMember({ userId, isOpen }: AssingMemberProps) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const allEmployee = useSelector(
    (state: RootState) => state.dataSlice.employee
  );

  const reportManagers = useSelector(
    (state: RootState) => state.dataSlice.employee
  ).filter((employee) => employee.role === Role.REPORT_MANAGER);

  const selectedReportManager = allEmployee.find(
    (employee) => employee.userId === userId
  );

  const reportManagerSupervisorId = reportManagers.find(
    (manager) =>
      manager.id ===
      allEmployee.find((mem) => mem.userId === selectedReportManager?.userId)
        ?.reportManagerId
  )?.userId;

  const unassignedMembers = useMemo(
    () =>
      allEmployee.filter(
        (emp) =>
          !emp.reportManagerId &&
          emp.role !== Role.ADMIN &&
          emp.userId !== userId &&
          (reportManagerSupervisorId
            ? emp.userId !== reportManagerSupervisorId
            : true)
      ),
    [allEmployee, userId, reportManagerSupervisorId]
  );

  const filteredUnassignedMembers = useMemo(() => {
    if (!input) return unassignedMembers;

    return unassignedMembers.filter((mem) =>
      mem.user.username.toLowerCase().includes(input.toLowerCase())
    );
  }, [input, unassignedMembers]);

  const toggleMemberSelection = (employee: Employee) => {
    setSelectedEmployees((prev) =>
      prev.some((emp) => emp.id === employee.id) // Change includes to some
        ? prev.filter((emp) => emp.id !== employee.id)
        : [...prev, employee]
    );
  };

  // Selected Report Manager based on the list

  // The userId of selected ReportManager -> Report Manager
  // Ex: If Selected Report Manager is Himanshu and the report manager of Himanshu is Akash
  // then selectedReportMangersManagerUserId hold the userId Akash.

  // 🔹 Determine the list of unassigned organisation members based on the following rules:
  // 1️⃣ Include only members who currently have no assigned report manager.
  // 2️⃣ Exclude members whose role is "ADMIN".
  // 3️⃣ Exclude members who are already assigned to a report manager.
  // 4️⃣ Exclude the selected Report Manager themselves.
  // 5️⃣ Exclude the manager of the selected Report Manager.
  //     Example: If the selected Report Manager is Himanshu and his manager is Akash,
  //     then Akash should not appear in the list of unassigned members

  // Filtering orgMembers based on searched OrgMember

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

  const selectedEmployeesIds = selectedEmployees.map((mem) => mem.id);
  console.log(selectedReportManager);

  //todo   🔹<--------  Assign selected organisation members under a specific report manager -------->
  function assignMember() {
    startTransition(async () => {
      try {
        // 🟩 Step 1: Send API request to assign members to the selected Report Manager
        const res = await axios.post("/api/reportManager/assign-member", {
          reportManagerId: selectedReportManager?.id,
          selectedEmployeesId: selectedEmployeesIds,
        });

        const { success, message } = res.data;

        if (!success) {
          ErrorToast(message);
          return;
        }

        // 🟦 Step 3: Update the Report Managers state — add assigned members to the selected manager

        const updatedEmployee = allEmployee.map((employee) => {
          const isReportManager = employee.id === selectedReportManager?.id;
          const isSelectedEmployee = selectedEmployees.some(
            (mem) => mem.id === employee.id
          );

          if (isReportManager) {
            return {
              ...employee,
              assignMembers: [
                ...(employee.assignMembers || []),
                ...selectedEmployees,
              ],
            };
          }
          if (isSelectedEmployee) {
            return {
              ...employee,
              reportManagerId: selectedReportManager?.id,
              reportManager: selectedReportManager!,
            };
          }
          return employee;
        });
        // console.log(updatedEmployee);

        dispatch(setEmployee(updatedEmployee));
        setSelectedEmployees([]);
        successToast("Members assigned successfully");
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
  //todo <----------- Remove (unassign) an organisation member from a Report Manager ------>
  //   async function removeOrgMember(memberId: string) {
  //     try {
  //       // 🟩 Step 1: Send API request to unassign the organisation member
  //       const res = await axios.post("/api/ReportManager/unassign-member", {
  //         selectedOrgMemberId: memberId,
  //       });

  //       const { success, message } = res.data;

  //       // 🟨 Step 2: Handle API failure — show error notification
  //       if (!success) {
  //         toast.error(message, {
  //           position: "bottom-right",
  //           duration: 3000,
  //           className: "bg-red-700 text-white border border-red-600",
  //           style: {
  //             backgroundColor: "#C1292E",
  //             color: "white",
  //             border: "1px solid #3E5692",
  //           },
  //         });
  //         return; // Exit early if unassignment failed
  //       }

  //       // 🟦 Step 3: Update the Report Managers state — remove the unassigned member
  //       //todo ---------->   main
  //       //   const updatedReportManagers = reportManagers.map((manager) =>
  //       //     manager.id === selectedReportManager?.id
  //       //       ? {
  //       //           ...manager,
  //       //           orgMembers: manager.orgMembers.filter(
  //       //             (member) => member.id !== memberId
  //       //           ),
  //       //         }
  //       //       : manager
  //       //   );
  //       //todo ---------->   main

  //       // 🟦 Step 4: Update Organisation Members state — set reportManagerId to null for the unassigned member
  //       const updatedEmployee = allEmployee.map((member) =>
  //         member.id === memberId ? { ...member, reportManagerId: null } : member
  //       );

  //       // 🟩 Step 5: Dispatch updated data to Redux store
  //       //todo ---------->   main
  //       //   dispatch(setOrganisationMember(updatedOrgMembers));
  //       //   dispatch(setReportManager(updatedReportManagers));
  //       //todo ---------->   main
  //     } catch (error: any) {
  //       // 🟥 Step 6: Handle unexpected errors gracefully
  //       console.error("Error unassigning member:", error);
  //       toast.error("Something went wrong while unassigning the member.", {
  //         position: "bottom-right",
  //         duration: 3000,
  //         className: "bg-red-700 text-white border border-red-600",
  //       });
  //     }
  //   }

  return (
    <div className="">
      <div className="flex justify-center flex-col">
        <p className="text-gray-600 font-gilRegular mb-3">
          Assign team members to report to{" "}
          <span className="font-gilSemiBold text-gray-900">
            {selectedReportManager?.user.username || "Selected Manager"}
          </span>
        </p>

        {/* Search Input */}
        <div ref={searchContainerRef} className="relative">
          <div className=" flex items-center gap-2 mb-3 border border-gray-300 rounded-lg px-3 py-2 transition-all bg-gray-50">
            <UserPlus size={18} className="text-gray-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search and add people..."
              className="w-full bg-transparent font-gilRegular outline-none placeholder:text-gray-400 placeholder:font-gilThin"
            />
          </div>

          {filteredUnassignedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 mt-2">
              <img src="/husky.gif" className="w-28 animate-scale-in" alt="" />
              <p className="font-gilRegular text-gray-600 text-sm">
                No members found
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[20rem]">
              <div className="grid space-y-2">
                {filteredUnassignedMembers?.map((employee: Employee) => (
                  <ul key={employee.id}>
                    <li
                      className={`relative cursor-pointer border rounded-md p-2 flex items-center gap-4 ${
                        selectedEmployees.some(
                          (emp) => emp.id === employee.id
                        ) && "bg-sky-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMemberSelection(employee);
                      }}
                    >
                      <div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="font-gilSemiBold text-gray-700">
                            {String(
                              employee.user.username.trim()[0]
                            ).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div>
                        <h2 className="font-gilSemiBold">
                          {employee.user.username}
                        </h2>
                        <h3 className="font-gilMedium text-gray-700 text-sm">
                          {employee.user.email}
                        </h3>
                        <p className="font-gilRegular text-gray-600 text-[0.7rem]">
                          Role: {employee.role}
                        </p>
                      </div>

                      {/* Here, i'm creating checkbox to select employees  */}
                      <div
                        className={`absolute right-5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedEmployees.some(
                            (emp) => emp.id === employee.id
                          )
                            ? "bg-sky-600 border-sky-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedEmployees.some(
                          (emp) => emp.id === employee.id
                        ) && (
                          <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </li>
                  </ul>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      <div className="mt-8 flex justify-end-safe items-center gap-3">
        <button
          className="cursor-pointer border px-3 py-1.5 rounded-sm font-gilMedium"
          onClick={() => isOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-lg px-5 py-2 cursor-pointer
                 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={assignMember}
          disabled={selectedEmployees.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span className="font-gilMedium">Assigning...</span>
            </>
          ) : (
            <>
              {/* 👤 Normal button state */}
              <UserPlus size={18} strokeWidth={1.5} className="text-white" />
              <span className="font-gilMedium">Assign Member</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AssignMember;
