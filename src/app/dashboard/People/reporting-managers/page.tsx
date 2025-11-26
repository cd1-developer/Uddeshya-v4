"use client";
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { Role } from "@/interfaces";
import { Employee } from "@/interfaces";
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
import { Input } from "@/components/ui/input";
import { UserPlus, UserRoundMinus, Users } from "lucide-react";

const OPTIONS = ["All Structure", "Manager (No Team)", "With Members"];

const ReportManager = () => {
  const [input, setInput] = useState("");
  const [searchTeamMember, setSearchTeamMember] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>(OPTIONS[0]);

  const reportManager = useSelector(
    (state: RootState) => state.dataSlice.employee
  ).filter((manager) => manager.role === Role.REPORT_MANAGER);
  console.log(reportManager);

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
        : searchedReportManager.filter((manager) =>
            manager.user.username.toLowerCase().includes(input.toLowerCase())
          ) ||
          searchedReportManager.filter((manager) =>
            manager.user.email.toLowerCase().includes(input.toLowerCase())
          );
    return searchedReportManager;
  }, [selectedValue, input]);

  function firstLetter(username: string) {
    let userName = username
      .trim()
      .split(" ")
      .map((name) => `${name[0].toUpperCase()}`)
      .join("");

    return userName;
  }

  return (
    <div>
      <header>
        <div className="flex items-center gap-5">
          <input
            className="flex-1 px-2 py-[0.3rem] rounded-md outline-none border font-gilRegular placeholder:tracking-wider placeholder:font-gilRegular placeholder:text-[0.75rem]"
            placeholder="Search Report Manager..."
            // value={input}
            // onChange={(e) => setInput(e.target.value)}
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
            <div className="flex flex-col items-center opacity-50">
              <span>
                <UserPlus size={32} strokeWidth={1.5} />
              </span>
              <span className="font-gilMedium text-lg">
                No Report Manager Found
              </span>
            </div>
          ) : (
            filterReportManagers?.map((manager: Employee) => (
              <li
                className=" bg-zinc-100 mt-7 px-1 sm:px-3 py-2 rounded-md shadow-md"
                key={manager.id}
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value={manager.id}
                    className="border-none w-full"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <AccordionTrigger className="cursor-pointer">
                        <div className="bg-blue-200  text-blue-900 w-10 h-10 flex items-center justify-center rounded-[50%] font-gilMedium sm:font-gilSemiBold text-sm sm:text-[1rem]">
                          {firstLetter(manager.user.username)}
                        </div>

                        <div className="flex items-center gap-3 w-full">
                          <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0 sm:gap-2 member">
                            <h2 className="font-gilSemiBold text-[1rem] sm:text-[1.2rem]">
                              {manager.user.username}
                            </h2>
                          </div>
                          <div className="text-[0.8rem] sm:text-[0.9rem] mt-1.5 sm:mt-0 font-gilMedium text-gray-600">
                            {manager.user.email}
                          </div>
                        </div>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent className="pl-0 sm:pl-16">
                      {manager.assignMembers.length === 0 ? (
                        <div className="flex flex-col gap-3 items-center justify-center">
                          <h2 className="text-zinc-400">
                            <Users size={30} />
                          </h2>

                          <h2 className="text-md text-zinc-500 font-gilRegular">
                            No members assigned yet
                          </h2>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {manager.assignMembers.map((teamMember) => (
                            <div
                              key={teamMember.id}
                              className="flex gap-2 items-center border-b border-neutral-300 pb-2 relative"
                            >
                              <h2 className="text-md h-8 w-8 flex items-center justify-center text-white font-gilMedium tracking-sm bg-zinc-400 px-3 py-0.5 rounded-4xl">
                                {firstLetter(teamMember.user.username)}
                              </h2>
                              <div className="flex flex-col ">
                                <h2 className="text-md font-gilSemiBold text-zinc-600">
                                  {teamMember.user.username}
                                </h2>
                                <h2 className="text-zinc-500 text-[0.8rem]">
                                  {teamMember.user.email}
                                </h2>
                              </div>

                              <div
                                className="cursor-pointer dlt-member"
                                // onClick={() => handleDeleteMember(teamMember.id)}
                              >
                                <UserRoundMinus
                                  size={14}
                                  strokeWidth={1.7}
                                  className="text-red-600"
                                />
                              </div>
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
