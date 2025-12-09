"use client";
import React, { useState, useMemo, startTransition } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { Role } from "@/interfaces";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AlertDialogCompo from "@/components/custom/AlertDialog/AlertDialogCompo";

import { Trash2, UserPlus, Users } from "lucide-react";
import { ErrorToast } from "@/components/custom/ErrorToast";
import axios from "axios";
import { forwardRef } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setEmployee } from "@/libs/dataslice";
import { Employee } from "@/interfaces";
import { successToast } from "@/components/custom/SuccessToast";

const OPTIONS = ["All Structure", "Manager (No Team)", "With Members"];

const ReportManager = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(OPTIONS[0]);
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const userInfo = useSelector((state: RootState) => state.dataSlice.userInfo);
  const reportManager = employees.filter(
    (emp: Employee) => emp.role === Role.REPORT_MANAGER
  );

  const roleOfCurrentUser = employees.find(
    (emp: Employee) => emp.userId === userInfo.id
  )?.role;

  function handleDropdown(value: string) {
    setSelectedValue(value);
  }

  const filterReportManagers = useMemo(() => {
    let searchedReportManager = [] as Employee[];

    if (selectedValue === "All Structure") {
      searchedReportManager = reportManager;
    } else if (selectedValue === "Manager (No Team)") {
      searchedReportManager = reportManager.filter(
        (manager) => manager.assignMembers.length === 0
      );
    } else if (selectedValue === "With Members") {
      searchedReportManager = reportManager.filter(
        (manager) => manager.assignMembers.length > 0
      );
    }

    searchedReportManager =
      input === ""
        ? searchedReportManager
        : searchedReportManager.filter(
            (manager) =>
              manager.user.username
                .toLowerCase()
                .includes(input.toLowerCase()) ||
              manager.user.email.toLowerCase().includes(input.toLowerCase())
          );
    // searchedReportManager.filter((manager) =>
    //   manager.user.email.toLowerCase().includes(input.toLowerCase())
    // );
    return searchedReportManager;
  }, [selectedValue, input, employees]);

  const handleDeleteMember = (teamMemberId: string) => {
    try {
      // 1️⃣ Find manager who has this member
      const manager = reportManager.find((manager: Employee) =>
        manager.assignMembers.some((mem: Employee) => mem.id === teamMemberId)
      );

      const reportManagerId = manager?.id;
      // const employeeId = manager?.assignMembers.find(
      //   (mem: Employee) => mem.id === teamMemberId
      // )?.id;
      const employeeId = teamMemberId;

      // 2️⃣ Validate IDs
      if (!reportManagerId || !employeeId) {
        ErrorToast("Unable to remove. Member or Manager not found.");
        return;
      }

      // 3️⃣ API Call with transition
      startTransition(async () => {
        try {
          const res = await axios.delete("/api/reportManager/remove-member", {
            data: {
              reportManagerId,
              employeeId,
            },
          });

          const { success, message } = res.data;

          // 4️⃣ If backend indicates failure
          if (!success) {
            ErrorToast(message || "Failed to remove member.");
            return;
          }

          // 5️⃣ Update local state
          const updatedReportManager = employees.map((emp: Employee) => {
            //! Remove from manager's assignMembers
            if (emp.id === reportManagerId) {
              return {
                ...emp,
                assignMembers: emp.assignMembers.filter(
                  (mem: Employee) => mem.id !== employeeId
                ),
              };
            }
            if (emp.id === employeeId) {
              return {
                ...emp,
                reportManagerId: undefined,
              };
            }
            return emp;
          }) as Employee[];

          dispatch(setEmployee(updatedReportManager));

          successToast(message || "Member removed successfully!");
        } catch (err: any) {
          // 6️⃣ Handle axios errors
          if (axios.isAxiosError(err)) {
            console.error("Axios Error:", err.response?.data || err.message);
            ErrorToast(
              err.response?.data?.message ||
                "Unable to connect to the server. Try again."
            );
          } else {
            console.error("Unexpected Error:", err);
            ErrorToast("Unexpected error occurred. Try again later.");
          }
        }
      });
    } catch (err) {
      // 7️⃣ Handle unexpected outer errors
      console.error("Outer Error:", err);
      ErrorToast("Something went wrong. Please try again.");
    }
  };
  function firstLetter(username?: string) {
    if (!username || typeof username !== "string") return "U";

    let parts = username.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "U";

    return parts.map((name) => name[0]?.toUpperCase() ?? "").join("") || "U";
  }

  return (
    <div>
      <header>
        <div className="flex items-center gap-5">
          <input
            className="flex-1 px-2 py-[0.3rem] rounded-md outline-none border font-gilRegular placeholder:tracking-wider placeholder:font-gilRegular placeholder:text-[0.75rem]"
            placeholder="Search Report Manager..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="drop-down">
            <Select
              defaultValue={OPTIONS[0]}
              onValueChange={(value) => handleDropdown(value)}
            >
              <SelectTrigger className="font-gilMedium">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="font-gilMedium">
                  {OPTIONS.map((option, i) => (
                    <SelectItem value={option} key={i}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      <div className="main">
        <ul className="member">
          {filterReportManagers.length === 0 ? (
            <div className="flex flex-col items-center absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] opacity-50">
              <span>
                <UserPlus size={26} strokeWidth={1} />
              </span>
              <span className="font-gilMedium text-md">
                No Report Manager Found
              </span>
            </div>
          ) : (
            filterReportManagers?.map((manager: Employee) => (
              <li
                className=" mt-3 px-1 sm:px-3 py-2 rounded-md"
                key={manager.id}
              >
                <Accordion
                  type="single"
                  collapsible
                  className="lg:w-[40vw] border-b"
                >
                  <AccordionItem
                    value={manager.id}
                    className="border-none lg:w-[40vw]"
                  >
                    <div className="gap-3 w-full">
                      <AccordionTrigger className="cursor-pointer">
                        <div className="bg-blue-100  text-sky-900 w-11 h-10 flex items-center justify-center rounded-4xl  font-gilSemiBold sm:text-[0.85rem]">
                          {firstLetter(manager.user.username)}
                        </div>

                        <div className="w-full">
                          <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0 sm:gap-2 member">
                            <h2 className="font-gilSemiBold text-[1rem] sm:text-[1.1rem]">
                              {manager.user.username}
                            </h2>
                          </div>
                          <div className="text-[0.8rem] mt-1.5 sm:mt-0 font-gilRegular text-gray-600">
                            {manager.user.email}
                          </div>
                        </div>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent className="pl-0 sm:pl-16">
                      {(manager.assignMembers?.length ?? 0) === 0 ? (
                        <div className="flex flex-col gap-3 items-center justify-center">
                          <h2 className="text-zinc-400">
                            <Users size={26} strokeWidth={1} />
                          </h2>

                          <h2 className="text-md text-zinc-500 font-gilRegular">
                            No members assigned yet
                          </h2>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {manager.assignMembers.map((teamMember: Employee) => (
                            <div
                              key={teamMember.id}
                              className="flex gap-2 items-center border-b border-neutral-300 pb-2 relative"
                            >
                              <h2 className="text-md h-8 w-8 flex items-center justify-center text-white font-gilMedium tracking-sm bg-zinc-400 px-3 py-0.5 rounded-4xl">
                                {/* {firstLetter(teamMember.user.username)} */}
                                {firstLetter(teamMember?.user?.username ?? "")}
                              </h2>
                              <div className="flex flex-col ">
                                <h2 className="text-md font-gilSemiBold text-zinc-600">
                                  {/* {teamMember.user.username} */}
                                  {teamMember?.user?.username || "Unknown User"}
                                </h2>
                                <h2 className="text-zinc-500 text-[0.8rem]">
                                  {/* {teamMember.user.email} */}
                                  {teamMember?.user?.email || "No email"}
                                </h2>
                              </div>
                              {roleOfCurrentUser === Role.ADMIN && (
                                <div className="cursor-pointer ml-auto">
                                  <AlertDialogCompo
                                    triggerButton={<DeleteButton />}
                                    isDisabled={isRemoving}
                                    onClickHandler={() =>
                                      handleDeleteMember(teamMember.id)
                                    }
                                    description={
                                      <Description
                                        title={
                                          teamMember?.user?.username ||
                                          "Unknown User"
                                        }
                                      />
                                    }
                                    actionTitle="Remove Member"
                                    loader="Removing..."
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReportManager;

const Description = ({ title }: { title: string }) => {
  return (
    <>
      Are you sure you want to remove{" "}
      <span className="font-gilSemiBold text-black">{title}</span> from this
      Report Manager? This action cannot be undone.
    </>
  );
};

const DeleteButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => (
  <Button
    ref={ref}
    {...props}
    className="bg-transparent hover:bg-transparent cursor-pointer text-black"
  >
    <Trash2 strokeWidth={1.2} color="red" />
  </Button>
));
