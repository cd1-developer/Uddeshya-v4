import { useEffect, useState } from "react";
import axios from "axios";
import POLICIES from "@/constant/Policies";
import { ErrorToast } from "@/components/custom/ErrorToast";

type LeaveInfo = {
  policyName: string;
  balance: number;
  approved: number;
  rejected: number;
  pending: number;
};

const useLeaveBalance = (employeeId: string) => {
  const [allLeaveInfo, setAllLeaveInfo] = useState<LeaveInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchLeaveInfo = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `/api/Employee/get-leave-balance?employeeId=${employeeId}`,
        );

        const { success, message, data } = res.data;

        if (!success) {
          ErrorToast(message);
        }
        setAllLeaveInfo(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch leave balance");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveInfo();
  }, [employeeId]);

  return {
    allLeaveInfo,
    loading,
    error,
  };
};

export default useLeaveBalance;
