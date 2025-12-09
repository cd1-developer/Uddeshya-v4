"use client";
import { useParams } from "next/navigation";
import React from "react";
import Profile from "@/app/Pages/Profile/Profile";
import MyApprovals from "@/app/Pages/MyApprovals/MyApprovals";
import People from "../People/people";
import Members from "../People/all-members/page";
import ReportManager from "../People/reporting-managers/page";
import MyTeam from "../People/my-team/page";
import Leaves from "../Leaves/leave";
import MyLeavesPage from "../Leaves/my-leaves/page";
import LeavePoliciesPage from "../Leaves/policies/page";
import TimelinePage from "../Leaves/timeline/page";
import BalancesPage from "../Leaves/balances/page";
import ReportsPage from "../Leaves/reports/page";
import LeavePeoplePage from "../Leaves/people/page";
import Core from "@/app/Pages/Core/Core";
import Dashboard from "../dashboard";
// import AllMembers from "@/app/Pages/People/all-members/page";

function DashboardRoutes() {
  const params = useParams();
  const { dashboardRoute, subRoute } = params;

  // Main routes
  if (dashboardRoute === "/") {
    return <Dashboard />;
  }

  if (dashboardRoute === "profile") {
    return <Profile />;
  }

  if (dashboardRoute === "approvals") {
    return <MyApprovals />;
  }

  if (dashboardRoute === "people") {
    if (!subRoute) {
      return <People />;
    } else if (subRoute === "all-members") {
      return <Members />;
    } else if (subRoute === "reporting-managers") {
      return <ReportManager />;
    } else if (subRoute === "my-team") {
      return <MyTeam />;
    }
    return <div>404 Page Not Found</div>;
  }
  if (dashboardRoute === "core") {
    return <Core />;
  }

  if (dashboardRoute === "leaves") {
    // Sub-routes for "leaves"
    if (!subRoute) {
      return <Leaves />;
    } else if (subRoute === "my-leaves") {
      return <MyLeavesPage />;
    } else if (subRoute === "policies") {
      return <LeavePoliciesPage />;
    } else if (subRoute === "timeline") {
      return <TimelinePage />;
    } else if (subRoute === "balances") {
      return <BalancesPage />;
    } else if (subRoute === "reports") {
      return <ReportsPage />;
    } else if (subRoute === "people") {
      return <LeavePeoplePage />;
    } else {
      return <div>404 Page Not Found</div>;
    }
  }

  // Fallback for unknown
  return <div>404 Page Not Found</div>;
}

export default DashboardRoutes;
