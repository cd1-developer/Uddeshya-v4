"use client";
import { useParams } from "next/navigation";
import React from "react";
import Home from "@/app/Pages/Home/Home";
import Profile from "@/app/Pages/Profile/Profile";
import MyApprovals from "@/app/Pages/MyApprovals/MyApprovals";
import People from "@/app/Pages/People/People";
import Leaves from "../Leaves/leave";
import MyLeavesPage from "../Leaves/my-leaves/page";
import LeavePoliciesPage from "../Leaves/policies/page";
import TimelinePage from "../Leaves/timeline/page";
import BalancesPage from "../Leaves/balances/page";
import ReportsPage from "../Leaves/reports/page";
import LeavePeoplePage from "../Leaves/people/page";
import Core from "@/app/Pages/Core/Core";

function DashboardRoutes() {
  const params = useParams();
  const { dashboardRoute, subRoute } = params;

  // Main routes
  if (dashboardRoute === "home") {
    return <Home />;
  }

  if (dashboardRoute === "profile") {
    return <Profile />;
  }

  if (dashboardRoute === "approvals") {
    return <MyApprovals />;
  }

  if (dashboardRoute === "people") {
    return <People />;
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
