"use client";
import { useEffect, useTransition, useMemo, useState } from "react";
import axios from "axios";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { useDispatch, useSelector } from "react-redux";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
import { setEmployee, setHolidays } from "@/libs/dataslice";
import { RootState } from "@/libs/store";
import { Button } from "@/components/ui/button";
import React from "react";
import { Plus, Trash2, Calendar, Cake, User, CalendarDays } from "lucide-react";
import { Employee, Role } from "@/interfaces";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import { Holiday } from "@prisma/client";
import { format } from "date-fns";
import { successToast } from "@/components/custom/SuccessToast";
import { Input } from "@/components/ui/input";
import { setLeave } from "@/libs/dataslice";
import dayjs from "dayjs";
import useFetchEmployees from "@/hooks/useFetchEmployees";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { UpComingDOBType } from "@/interfaces";
const Dashboard = () => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [upComingdateOfBirth, setUpComingDataOfBirth] = useState<
    UpComingDOBType[]
  >([]);
  const { fetchEmployees } = useFetchEmployees();

  const holidays = useSelector((state: RootState) => state.dataSlice.holiday);
  const userInfo = useSelector((state: RootState) => state.dataSlice.userInfo);
  const employees = useSelector((state: RootState) => state.dataSlice.employee);

  const employeeId = employee?.id;

  const currentUserRole = employee?.role;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!userInfo || !userInfo.id) return;

    async function fetchEmployeeInfo() {
      try {
        const res = await axios.get(
          `/api/Employee/get-employee?userId=${userInfo.id}`
        );

        const { success, message, data } = res.data;

        if (!success) {
          ErrorToast(message);
          return;
        }

        setEmployee(data);
      } catch (err) {
        ErrorToast("Failed to load employee data");
      }
    }

    fetchEmployeeInfo();
  }, [userInfo]);

  useEffect(() => {
    const fetchLeavesData = async () => {
      if (!employeeId) return;
      if (employee.role === Role.ADMIN) return;

      try {
        const response = await axios.get(
          `/api/leave/employee?employeeId=${employeeId}`
        );

        const { success, data, message } = response.data;

        if (!success) {
          ErrorToast(message || "Failed to fetch members");
          return;
        }

        dispatch(setLeave(data));
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Error fetching members: ", errorMessage);
        ErrorToast("Failed to load Leaves ");
      }
    };
    startTransition(() => {
      fetchLeavesData();
    });
  }, [employeeId]);

  useEffect(() => {
    async function fetchBirthDays() {
      try {
        const res = await axios.get("/api/Employee/get-upcoming-birthdays");

        const { success, message, data } = res.data;

        if (!success) {
          ErrorToast(message || "Failed to load birthdays");
          return;
        }

        setUpComingDataOfBirth(data);
      } catch (error: any) {
        console.error("Error fetching upcoming birthdays:", error);
        ErrorToast("Something went wrong while fetching birthdays");
      }
    }

    fetchBirthDays();
  }, []);

  const fetchHolidays = () => {
    startTransition(async () => {
      try {
        const res = await axios.get("/api/holiday/get-holidays");
        const { success, message, holidays } = res.data;
        if (!success) {
          ErrorToast(message || "Failed to fetch holidays");
        }
        dispatch(setHolidays(holidays));
      } catch (error: any) {
        console.error("Error fetching holidays: ", error.message);
        ErrorToast("Failed to load holidays");
      }
    });
  };

  const removeHoliday = async (id: string) => {
    const res = await axios.delete(`/api/holiday/delete-holiday?id=${id}`);
    const { success, message } = res.data;
    if (!success) {
      ErrorToast(message);
      return;
    }
    const updatedHolidays = holidays.filter((holiday) => holiday.id !== id);
    dispatch(setHolidays(updatedHolidays));
    successToast(message);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, []);

  if (isPending) {
    return <img src="naruto.gif" />;
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl md:text-3xl font-gilSemiBold text-gray-900">
            Dashboard
          </h1>
          <p className="text-xs font-gilRegular text-gray-500">
            Occasions overview
          </p>
        </div>

        {currentUserRole === "ADMIN" && (
          <Button
            onClick={() => setIsOpen(true)}
            className="flex items-center font-gilMedium text-xs cursor-pointer gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Occasion
          </Button>
        )}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holidays */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-md md:text-lg font-gilSemiBold text-gray-900">
                    All Holidays
                  </h2>
                  <p className="text-xs font-gilRegular text-gray-500">
                    {holidays.length} total
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Fade at top */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />

            <ScrollArea className="p-2 max-h-75 overflow-y-auto scrollbar-custom">
              {holidays.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-lg m-2">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-gilMedium text-gray-500">
                    No holidays yet
                  </p>
                  <p className="text-sm font-gilRegular text-gray-400 mt-1">
                    Add holidays to see them here
                  </p>
                </div>
              ) : (
                holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 m-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <p className="font-gilMedium text-gray-900">
                          {holiday.holidayName}
                        </p>
                      </div>

                      <p className="text-sm font-gilRegular text-gray-600">
                        {new Date(holiday.holidayDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {currentUserRole === Role.ADMIN && (
                      <button
                        onClick={() => removeHoliday(holiday.id)}
                        className="ml-3 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Delete ${holiday.holidayName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}

              <ScrollBar />
            </ScrollArea>

            {/* Fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
          </div>
        </section>

        {/* Birthdays */}
        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-md md:text-lg font-gilSemiBold text-gray-900">
                    Upcoming Birthdays
                  </h2>
                  <p className="text-xs font-gilRegular text-gray-500">
                    {upComingdateOfBirth.length} upcoming
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Top fade shadow */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />

            <div className="p-2 max-h-96 overflow-y-auto scrollbar-custom">
              {upComingdateOfBirth.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-lg m-2">
                  <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-gilMedium text-gray-500">
                    No upcoming birthdays
                  </p>
                  <p className="text-sm font-gilRegular text-gray-400 mt-1">
                    Check back later for celebrations
                  </p>
                </div>
              ) : (
                upComingdateOfBirth.map((dobInfo: UpComingDOBType) => (
                  <div
                    key={dobInfo.id}
                    className="flex items-center gap-4 p-4 m-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>

                    {/* User info */}
                    <div className="flex-1">
                      <p className="font-gilSemiBold text-gray-900">
                        {dobInfo.username}
                      </p>
                      <p className="text-sm font-gilRegular text-gray-600">
                        {new Date(dobInfo.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {/* Today badge */}
                    {new Date(dobInfo.dateOfBirth).getDate() ===
                      new Date().getDate() &&
                      new Date(dobInfo.dateOfBirth).getMonth() ===
                        new Date().getMonth() && (
                        <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-gilMedium rounded-full">
                          Today
                        </span>
                      )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom fade shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
          </div>
        </section>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-gilRegular text-gray-500">
                Total Holidays
              </p>
              <p className="text-xl font-gilSemiBold text-gray-900">
                {holidays.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-gilRegular text-gray-500">
                Upcoming Birthdays
              </p>
              <p className="text-xl font-gilSemiBold text-gray-900">
                {upComingdateOfBirth.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-gilRegular text-gray-500">
                This Month
              </p>
              <p className="text-xl font-gilSemiBold text-gray-900">
                {
                  upComingdateOfBirth.filter(
                    (dob) =>
                      new Date(dob.dateOfBirth).getMonth() ===
                      new Date().getMonth()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Occasion Modal */}
      <DialogCompo
        isOpen={isOpen}
        onOpenChange={() => setIsOpen((prev: boolean) => !prev)}
      >
        <AddOccasionCompo setIsOpen={setIsOpen} />
      </DialogCompo>
    </div>
  );
};

export default Dashboard;

interface AddOccasionCompoProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddOccasionCompo = ({ setIsOpen }: AddOccasionCompoProps) => {
  const dispatch = useDispatch();
  const holidays = useSelector((state: RootState) => state.dataSlice.holiday);
  const [holidaysInfo, setholidaysInfo] = useState<Holiday>({
    id: crypto.randomUUID(),
    holidayName: "",
    holidayDate: new Date(),
  } as Holiday);
  const [isPending, startTransition] = useTransition();

  const onChange: DatePickerProps["onChange"] = (date) => {
    if (date) {
      setholidaysInfo((prev) => ({
        ...prev,
        holidayDate: (date as dayjs.Dayjs).toDate(),
      }));
    }
  };

  function onAddOccasion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { holidayName, holidayDate } = holidaysInfo;

    // if occasion date is already exist in the Occasion Calender

    const isHolidayExist = holidays.some(
      (holiday: Holiday) =>
        format(holiday.holidayDate, "yyyy-MM-dd") ===
        format(holidayDate, "yyyy-MM-dd")
    );

    if (!isHolidayExist) {
      startTransition(async () => {
        try {
          const res = await axios.post("/api/holiday/add-holiday", {
            holidayDate,
            holidayName,
          });

          const { success, message, data: newHoliday } = res.data;

          if (!success) {
            ErrorToast(message || "Failed to add occasion");
            return; // Stop execution if failed
          }

          const updatedOccasionCalender = [...holidays, newHoliday];
          dispatch(setHolidays(updatedOccasionCalender));

          setIsOpen(false);
          setholidaysInfo({
            holidayDate: new Date(),
            holidayName: "",
            id: crypto.randomUUID(),
          });

          successToast(message);
        } catch (error) {
          console.error("Error adding occasion:", error);

          // Handle Axios errors safely
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : "An unexpected error occurred while adding the occasion.";

          ErrorToast(errorMessage);
        }
      });
    } else {
      ErrorToast(
        `${format(
          holidayDate,
          "yyyy-MM-dd"
        )} already exist in Occasion Calender`
      );
    }
  }

  function onCancel() {
    setholidaysInfo({
      holidayDate: new Date(),
      holidayName: "",
      id: crypto.randomUUID(),
    });
    setIsOpen(false);
  }
  return (
    <div>
      <h2 className="text-xl font-gilSemiBold text-gray-800 text-center">
        🎉 Add a New Occasion
      </h2>

      <form onSubmit={onAddOccasion} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-gilMedium text-gray-700">
            Occasion Date
          </label>
          <DatePicker
            onChange={onChange}
            className="w-full border rounded-md py-2 px-3 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 font-gilRegular"
            size="large"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-gilMedium text-gray-700">
            Occasion Name
          </label>
          <Input
            className="font-gilRegular"
            type="text"
            placeholder="e.g., Team Anniversary, Festival..."
            value={holidaysInfo.holidayName}
            onChange={(e) =>
              setholidaysInfo((prev) => ({
                ...prev,
                holidayName: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex justify-end items-center gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="text-gray-700 hover:bg-gray-100 font-gilRegular transition-all"
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="font-medium">
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white font-gilRegular rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              <div className="font-gilRegular">Add Occasion</div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
