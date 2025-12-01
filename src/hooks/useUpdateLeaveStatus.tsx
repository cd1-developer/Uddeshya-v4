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
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { getBalance } from "../../helper/getBalance";
import POLICIES from "@/constant/Policies";
import axios from "axios";

interface UseUpdateLeaveStatusProps {
  setAllLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
  setAssignMembers: React.Dispatch<React.SetStateAction<Employee[]>>;
}
const useUpdateLeaveStatus = ({
  setAllLeaves,
  setAssignMembers,
}: UseUpdateLeaveStatusProps) => {
  const [isPending, startTransition] = useTransition();
  //   const leaveTypes = useSelector(
  //     (state: RootState) => state.dataSlice.leaveTypes
  //   );
  const holidays = useSelector((state: RootState) => state.dataSlice.holiday);

  function updateLeaveStatus(leave: Leave, updatedStatus: LeaveStatus) {
    startTransition(async () => {
      const {
        id,
        LeaveStatus,
        employeeId,
        startDateTime,
        startAbsentType,
        endDateTime,
        endAbsentType,
        policyName,
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
          rejectReason,
        });
        const { success, message } = res.data;
        if (!success) {
          ErrorToast(message);
          return;
        }

        setAllLeaves((prev) =>
          prev.map((leave) =>
            leave.id === id ? { ...leave, leaveStatus: updatedStatus } : leave
          )
        );
        if (updatedStatus === LeaveStatus.Approved) {
          // If Leave is approved then update the total Balance of the orgMember
          setAssignMembers((prev: OrganisationMember[]) => {
            return prev.map((member: OrganisationMember) => {
              if (member.id === orgMemberId) {
                // Update Total balance
                member.totalBalances.map((leaveBalance: TotalBalance) =>
                  leaveBalance.policyName === leaveType.policyName
                    ? {
                        ...leaveBalance,
                        balance: leaveBalance.balance - deductedBalance,
                      }
                    : leaveBalance
                );
              }
              return member;
            });
          });
        }

        // Update the leave status of the leave
        setAssignMembers((prev: OrganisationMember[]) => {
          return prev.map((member: OrganisationMember) => {
            if (member.id === orgMemberId) {
              // Update Total balance
              member.leaves.map((appliedLeave: Leaves) =>
                appliedLeave.id === id
                  ? {
                      ...appliedLeave,
                      leaveStatus: updatedStatus,
                    }
                  : appliedLeave
              );
            }
            return member;
          });
        });
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
