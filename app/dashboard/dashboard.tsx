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
import { Plus, Trash2 } from "lucide-react";
import { Role } from "@/interfaces";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import { Holiday } from "@prisma/client";
import { format } from "date-fns";
import { successToast } from "@/components/custom/SuccessToast";
import { Input } from "@/components/ui/input";
import { setLeave } from "@/libs/dataslice";
import dayjs from "dayjs";

type UpComingDOBType = {
  id: string;
  username: string;
  dateOfBirth: Date;
};
const Dashboard = () => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const holidays = useSelector((state: RootState) => state.dataSlice.holiday);
  const userInfo = useSelector((state: RootState) => state.dataSlice.userInfo);
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const currentUserId = useSelector(
    (state: RootState) => state.dataSlice.userInfo.id
  );

  const employeeId = employees.find((emp) => emp.userId === currentUserId)?.id;

  useEffect(() => {
    const fetchLeavesData = async () => {
      if (!employeeId) return;

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

  const upComingdateOfBirth = useMemo(() => {
    if (employees.length === 0 || !employees) {
      return [];
    }
    return employees
      .filter((emp) => {
        if (!emp.user.dateOfBirth) {
          return false;
        }
        const today = new Date();
        const dateFromDOB = new Date(emp.user.dateOfBirth).getDate();
        const monthFromDOB = new Date(emp.user.dateOfBirth).getMonth();
        const currentYear = today.getFullYear();
        // date of birth based on current year
        const birthDay = new Date(currentYear, monthFromDOB, dateFromDOB);
        if (birthDay >= today) {
          return true;
        }
      })
      .map((emp) => ({
        id: emp.id,
        username: emp.user.username,
        dateOfBirth: emp.user.dateOfBirth,
      })) as UpComingDOBType[];
  }, []);
  const currentUserRole = employees.find(
    (emp) => emp.userId === userInfo.id
  )?.role;

  const dispatch = useDispatch();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/Employee/get-employees`);

      const { success, data, message } = response.data;

      if (!success) {
        ErrorToast(message || "Failed to fetch members");
        return;
      }

      dispatch(setEmployee(data));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error fetching members: ", errorMessage);
      ErrorToast("Failed to load members");
    }
  };

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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-gilSemiBold">Dashboard</h1>

        {currentUserRole === "ADMIN" && (
          <Button
            onClick={() => setIsOpen(true)}
            className="flex items-center font-gilRegular gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Occasion
          </Button>
        )}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Holidays */}
        <section className="rounded-xl p-5 border shadow-sm bg-white">
          <h2 className="text-lg font-gilMedium mb-4">All Holidays</h2>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {holidays.length === 0 && (
              <h2 className="font-gilRegular">😔 No Holidays</h2>
            )}
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-gilMedium">{holiday.holidayName}</p>
                  <p className="text-sm font-gilRegular text-gray-600">
                    {new Date(holiday.holidayDate).toDateString()}
                  </p>
                </div>

                {currentUserRole === Role.ADMIN && (
                  <button
                    onClick={() => removeHoliday(holiday.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Birthdays */}
        <section className="rounded-xl p-5 border shadow-sm bg-white">
          <h2 className="text-lg font-gilMedium mb-4">Upcoming Birthdays</h2>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {upComingdateOfBirth.length === 0 && (
              <h2 className="font-gilRegular">🎂 No Upcoming Birthdays</h2>
            )}
            {upComingdateOfBirth.map((dobInfo: UpComingDOBType) => (
              <div
                key={dobInfo.id}
                className="border p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium">{dobInfo.username}</p>
                <p className="text-sm text-gray-600">
                  {new Date(dobInfo.dateOfBirth).toDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
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
