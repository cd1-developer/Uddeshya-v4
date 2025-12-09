// hooks/useTeamView.ts
import { useMemo } from "react";
import { Employee, Role } from "@/interfaces";
import {
  AdminViewData,
  ReportManagerViewData,
  MemberViewData,
  TeamViewData,
} from "@/types/team.types";

export const useTeamView = (
  employees: Employee[],
  currentEmployee?: Employee
): TeamViewData => {
  return useMemo(() => {
    const roleOfCurrentUser = currentEmployee?.role;

    const getAdminView = (): AdminViewData => {
      const unassignedMembers = employees.filter(
        (member) => member.role === Role.MEMBER && !member.reportManagerId
      );

      const unassignedReportManagers = employees.filter(
        (member) =>
          member.role === Role.REPORT_MANAGER && !member.reportManagerId
      );

      return {
        title: "Organization Overview - Unassigned Members",
        description:
          "Manage all unassigned team members across the organization",
        unassignedMembers,
        unassignedReportManagers,
      };
    };

    const getReportManagerView = (): ReportManagerViewData => {
      const myTeamMembers = employees.filter(
        (member) => member.reportManagerId === currentEmployee?.id
      );

      const membersWithoutManagers = employees.filter(
        (member) => member.role === Role.MEMBER && !member.reportManagerId
      );

      return {
        title: `My Team - ${
          currentEmployee?.user?.username || "My"
        } Team Members`,
        description:
          "Manage your direct reports and view available unassigned members",
        myTeamMembers,
        availableUnassignedMembers: membersWithoutManagers,
      };
    };

    const getMemberView = (): MemberViewData => {
      const myManager = employees.find(
        (emp) => emp.id === currentEmployee?.reportManagerId
      );

      const teamMembers = employees.filter(
        (member) =>
          member.reportManagerId === currentEmployee?.reportManagerId &&
          member.id !== currentEmployee?.id
      );

      return {
        title: "My Team Overview",
        description: "View your team structure and reporting hierarchy",
        myManager,
        teamMembers,
      };
    };

    switch (roleOfCurrentUser) {
      case Role.ADMIN:
        return getAdminView();
      case Role.REPORT_MANAGER:
        return getReportManagerView();
      case Role.MEMBER:
        return getMemberView();
      default:
        return getAdminView();
    }
  }, [employees, currentEmployee]);
};
