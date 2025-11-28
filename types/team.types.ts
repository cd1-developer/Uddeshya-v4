// types/team.types.ts
import { Employee } from "@/interfaces";

export interface AdminViewData {
  title: string;
  description: string;
  unassignedMembers: Employee[];
  unassignedReportManagers: Employee[];
}

export interface ReportManagerViewData {
  title: string;
  description: string;
  myTeamMembers: Employee[];
  availableUnassignedMembers: Employee[];
}

export interface MemberViewData {
  title: string;
  description: string;
  myManager?: Employee;
  teamMembers: Employee[];
}

export type TeamViewData =
  | AdminViewData
  | ReportManagerViewData
  | MemberViewData;
