"use client";
import React, { useEffect } from "react";
import { Role } from "@/interfaces";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/libs/store";
import { setLeave } from "@/libs/dataslice";
import { ErrorToast } from "@/components/custom/ErrorToast";
import axios from "axios";

function LeaveLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const employee = useSelector(
    (state: RootState) => state.dataSlice.employeeInfo,
  );
  useEffect(() => {
    const fetchLeavesData = async () => {
      if (!employee.id) return;
      if (employee.role === Role.ADMIN) return;

      try {
        const response = await axios.get(
          `/api/leave/employee?employeeId=${employee.id}`,
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

    fetchLeavesData();
  }, [employee.id]);

  return <div>{children}</div>;
}

export default LeaveLayout;
