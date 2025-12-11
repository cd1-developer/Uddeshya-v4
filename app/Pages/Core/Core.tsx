"use client";

import { useEffect, useState, useTransition } from "react";
import { useSelector } from "react-redux";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeaveRequests from "./Core-Compo/LeaveRequests";
import LeaveBalances from "./Core-Compo/LeaveBalances";
import { RootState } from "@/libs/store";
import axios from "axios";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { Leave, Employee, Role } from "@/interfaces";

const Core = () => {
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [assignMembers, setAssignMembers] = useState<Employee[]>([]);
  const TABS = [
    {
      tab: "Leave Balances",
      compo: (
        <LeaveBalances
          assignMembers={assignMembers}
          setAssignMembers={setAssignMembers}
        />
      ),
    },
    {
      tab: "Leave Requests",
      compo: (
        <LeaveRequests
          allLeaves={allLeaves}
          setAllLeaves={setAllLeaves}
          setAssignMembers={setAssignMembers}
        />
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(TABS[0].tab);

  const [isPending, setTransition] = useTransition();

  const { userId, employees } = useSelector((state: RootState) => {
    const { userInfo, employee } = state.dataSlice;
    return {
      userId: userInfo.id,
      employees: employee,
    };
  });
  const reportManagers = employees.filter(
    (emp) => emp.role === Role.REPORT_MANAGER
  );
  const reportManagerId = reportManagers.find(
    (manager) => manager.userId === userId
  )?.id;

  const currentEmpInfo = employees.find((emp) => emp.userId === userId);
  const currentUserRole = currentEmpInfo?.role;

  const adminInfo = employees.find((emp) => emp.role === Role.ADMIN);

  const fetchAppliedLeaves = async (id: string) => {
    try {
      const res = await axios.get(
        `/api/leave/reportManager?reportManagerId=${id}`
      );

      const { success, message, data } = res.data;

      if (!success) {
        ErrorToast(message || "Failed to fetch applied leaves.");
        return;
      }
      // console.log(id);

      setAllLeaves(data as Leave[]);
    } catch (error: any) {
      // Axios error types
      if (error.response) {
        // Server responded with 4xx or 5xx
        ErrorToast(error.response.data?.message || "Server error occurred.");
      } else if (error.request) {
        // No response received
        ErrorToast("No response from server. Please check your network.");
      } else {
        // Something else (wrong URL, code error)
        ErrorToast(error.message || "Unexpected error occurred.");
      }

      console.error("fetchAppliedLeaves error:", error);
    }
  };

  useEffect(() => {
    // If Current Role of user is ADMIN then get all orgMembers
    // who has no reportManager which means those who has no reportManager
    // they are automatically assign to ADMIN
    // else get the AssignMembers based on reportManagerID if currentRole of user is ReportManager
    // ! const members =
    // !   currentUserRole === Role.ADMIN
    // !     ? employees.filter(
    // !         (emp: Employee[]) => !emp.reportManagerId
    // !       )
    // !     : employees.filter(
    // !         (member) => member.reportManagerId === reportManagerId
    // !       );
    // ! setAssignMembers(members);
    const employee =
      currentUserRole === Role.ADMIN
        ? employees.filter((emp) => !emp.reportManagerId)
        : employees.filter((emp) => emp.reportManagerId === reportManagerId);

    setAssignMembers(employee);
  }, []);

  useEffect(() => {
    const id =
      currentUserRole === Role.REPORT_MANAGER
        ? reportManagerId
        : currentEmpInfo?.id;
    if (!id) {
      return;
    }

    setTransition(() => {
      fetchAppliedLeaves(id as string);
    });
  }, [reportManagerId, adminInfo?.id]);

  return (
    <main>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="space-x-2">
          {TABS.map((tab, i) => (
            <TabsTrigger key={i} value={tab.tab}>
              <h3 className="font-gilSemiBold text-xs sm:text-[0.9rem]">
                {tab.tab}
              </h3>
            </TabsTrigger>
          ))}
        </TabsList>
        <hr />
        {TABS.map((tab, i) => (
          <TabsContent value={tab.tab} key={i}>
            {tab.compo}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
};

export default Core;
