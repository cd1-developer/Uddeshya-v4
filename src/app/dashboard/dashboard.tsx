"use client";
import { useEffect, useTransition } from "react";
import axios from "axios";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { setEmployee } from "@/libs/dataslice";
import { RootState } from "@/libs/store";

const Dashboard = () => {
  const [isPending, startTransition] = useTransition();
  const dispatch = useDispatch();
  const navigate = useRouter();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/Employee/get-employees`);

      const { success, data, message } = response.data;
      console.log(response.data);

      if (!success) {
        ErrorToast(message || "Failed to fetch members");
        return;
      }
      startTransition(() => {
        dispatch(setEmployee(data));
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error fetching members: ", errorMessage);
      ErrorToast("Failed to load members");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return <div>Dashboard</div>;
};

export default Dashboard;
