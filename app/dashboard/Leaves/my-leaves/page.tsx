"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeaveRequest from "./MyLeaveCompo/LeaveRequest";
import LeaveBalance from "./MyLeaveCompo/LeaveBalance";

const TABS = [
  {
    tab: "Leave Balance",
    compo: <LeaveBalance />,
  },
  {
    tab: "Leave Request",
    compo: <LeaveRequest />,
  },
];

const MyLeavesPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].tab);

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

export default MyLeavesPage;
