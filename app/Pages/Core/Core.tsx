"use client";

import { useEffect, useState, useTransition } from "react";
import { useSelector } from "react-redux";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeaveRequests from "./Core-Compo/LeaveRequests";
import LeaveBalances from "./Core-Compo/LeaveBalances";
import { RootState } from "@/libs/store";
import axios from "axios";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { Leave, Employee } from "@/interfaces";

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

  const userId = useSelector((state: RootState) => state.dataSlice.userInfo.id);

  const fetchAppliedLeaves = async (id: string) => {
    try {
      const res = await axios.get(
        `/api/leave/reportManager?reportManagerId=${id}`,
      );

      const { success, message, data } = res.data;
      console.log(data);

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

  // Load everything Core needs directly, independent of the paginated
  // all-members list. The endpoint returns the current user's assigned
  // members (ADMIN → members with no report manager, REPORT_MANAGER →
  // their assigned members) plus their own employeeId for the leaves fetch.
  const fetchCoreData = async (uid: string) => {
    try {
      const res = await axios.get(
        `/api/Employee/assigned-members?userId=${uid}`,
      );

      const { success, message, data } = res.data;

      if (!success) {
        ErrorToast(message || "Failed to load team data");
        return;
      }

      setAssignMembers(data.assignMembers as Employee[]);
      // Leaves actioned by the current user (admin or report manager)
      await fetchAppliedLeaves(data.employeeId as string);
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Failed to load team data");
      console.error("fetchCoreData error:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    setTransition(() => {
      fetchCoreData(userId);
    });
  }, [userId]);

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
