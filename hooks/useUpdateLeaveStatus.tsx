import { useTransition } from "react";
import { successToast } from "@/components/custom/SuccessToast";
import { ErrorToast } from "@/components/custom/ErrorToast";

import {
  Leave,
  LeaveStatus,
  leavePolicy,
  Employee,
  EmployeeLeaveBalance,
} from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { getBalance } from "@/helper/getBalance";
import POLICIES from "@/constant/Policies";
import axios from "axios";
import { setEmployee } from "@/libs/dataslice";

interface UseUpdateLeaveStatusProps {
  setAllLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
  setAssignMembers: React.Dispatch<React.SetStateAction<Employee[]>>;
  rejectedReason?: string;
}
const useUpdateLeaveStatus = ({
  setAllLeaves,
  setAssignMembers,
  rejectedReason,
}: UseUpdateLeaveStatusProps) => {
  const [isPending, startTransition] = useTransition();
  const dispatch = useDispatch();

  const holidays = useSelector((state: RootState) => state.dataSlice.holiday);
  const employees = useSelector((state: RootState) => state.dataSlice.employee);

  function updateLeaveStatus(leave: Leave, updatedStatus: LeaveStatus) {
    startTransition(async () => {
      const {
        id,
        // LeaveStatus,
        employeeId,
        startDateTime,
        startAbsentType,
        endDateTime,
        endAbsentType,
        policyName,
        reason,
      } = leave;

      const leavePolicies = POLICIES.find(
        (item) => item.policyName === policyName
      ) as leavePolicy;

      const deductedBalance = getBalance({
        startDateTime,
        endDateTime: endDateTime ?? new Date(),
        startAbsentType,
        endAbsentType,
        leavePolicies,
        holidays,
      });
      try {
        const res = await axios.post("/api/leave/update-leave-status", {
          leaveId: id,
          employeeId,
          updatedStatus: updatedStatus,
          policyName,
          deductedBalance,
          rejectReason: rejectedReason,
        });
        const { success, message } = res.data;
        if (!success) {
          ErrorToast(message);
          return;
        }

        setAllLeaves((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, LeaveStatus: updatedStatus } : l
          )
        );

        setAssignMembers((prev) =>
          prev.map((emp) => {
            if (emp.id !== employeeId) return emp;

            return {
              ...emp,
              leaveBalances:
                updatedStatus === LeaveStatus.APPROVED
                  ? emp.leaveBalances.map((b) =>
                      b.policyName === leavePolicies.policyName &&
                      b.employeeId === employeeId
                        ? { ...b, balance: b.balance - deductedBalance }
                        : b
                    )
                  : emp.leaveBalances,

              leavesApplied: emp.leavesApplied.map((appliedLeave) =>
                appliedLeave.id === id
                  ? { ...appliedLeave, LeaveStatus: updatedStatus }
                  : appliedLeave
              ),
            };
          })
        );
        // updated Leave Status in Global employee state
        const updatedEmployees = employees.map((emp) =>
          emp.id === employeeId
            ? {
                ...emp,
                leavesApplied: emp.leavesApplied.map((leave) =>
                  leave.id === id
                    ? {
                        ...leave,
                        LeaveStatus: updatedStatus,
                        ...(updatedStatus === LeaveStatus.REJECTED && {
                          rejectReason: rejectedReason,
                        }),
                      }
                    : leave
                ),
              }
            : emp
        );
        console.log(updatedEmployees);
        // set to global employee state
        dispatch(setEmployee(updatedEmployees));
        successToast(message);
      } catch (error: any) {
        console.error(error.message);
        ErrorToast(error.message || "Error in approving leaves");
      }
    });
  }
  return {
    isPending,
    updateLeaveStatus,
  };
};

export default useUpdateLeaveStatus;
