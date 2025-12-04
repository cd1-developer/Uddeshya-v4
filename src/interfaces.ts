export interface User {
  id: string;
  username: string;
  email: string;
  dateOfBirth?: Date;
  gender?: Gender;
  createdAt: Date;
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  role: Role;
  reportManagerId?: string;
  joiningDate?: Date;
  probationEnd: String;
  status: EmployeeStatus;
  // Relations
  user: User;
  reportManager?: Employee;
  assignMembers: Employee[];
  leaveBalances: EmployeeLeaveBalance[];
  employeeLatestIncrement: EmployeeLatestIncrement[];
  leavesApplied: Leave[];
  leavesActioned: Leave[];
}

export interface EmployeeLeaveBalance {
  id: string;
  employeeId: string;
  balance: number;
  lastUpdated: Date;
  policyName: string;
  // Relation
  employee: Employee;
}

export interface EmployeeLatestIncrement {
  id: string;
  policyName: string;
  dateOfIncrement: Date;
  employee_id: string;
  // Relation
  employee: Employee;
}

export interface Leave {
  id: string;
  employeeId: string;
  policyName: string;
  startDateTime: Date;
  startAbsentType: AbsentType;
  endDateTime?: Date;
  endAbsentType?: AbsentType;
  LeaveStatus: LeaveStatus;
  reason?: string;
  rejectReason?: string;
  actionByEmployeeId?: string;
  actionDate?: Date;

  // Relations
  applicant: Employee;
  actionBy?: Employee;
}
export interface leavePolicy {
  id: string;
  policyName: string;
  description: string;
  accural: number;
  accuralFrequency: AccuralFrequency;
  capped?: number;
  maxApply?: number;
  sandwich: boolean;
}

export interface Holiday {
  id: string;
  holidayName: string;
  holidayDate: Date;
}

// ------------------ ENUMS ------------------

export enum Role {
  ADMIN = "ADMIN",
  SUB_ADMIN = "SUB_ADMIN",
  REPORT_MANAGER = "REPORT_MANAGER",
  MEMBER = "MEMBER",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AbsentType {
  FULL_DAY = "FULL_DAY",
  FIRST_HALF = "FIRST_HALF",
  SECOND_HALF = "SECOND_HALF",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export enum AccuralFrequency {
  Monthly = "Monthly",
  Quarterly = "Quarterly",
}

export enum EmployeeStatus {
  Active = "Active",
  InActive = "InActive",
  Probation = "Probation",
}
