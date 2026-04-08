"use client";
import React, { useEffect } from "react";
import { Role } from "@/interfaces";
import { useDispatch } from "react-redux";
import { setLeave } from "@/libs/dataslice";
import { ErrorToast } from "@/components/custom/ErrorToast";
import axios from "axios";
import { useSession } from "next-auth/react";

function LeaveLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  useEffect(() => {
    const fetchLeavesData = async () => {
      if (!session?.user.employee_id) return;
      if (session.user.role === Role.ADMIN) return;

      try {
        const response = await axios.get(
          `/api/leave/employee?employeeId=${session.user.employee_id}`,
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
  }, [session?.user.employee_id]);

  return <div>{children}</div>;
}

export default LeaveLayout;
