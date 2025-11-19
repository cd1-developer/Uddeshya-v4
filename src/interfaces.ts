export interface User {
  id: string;
  username: string;
  email: string;
  dateOfBirth: Date;
  gender?: Gender;
  CreatedAt: Date;
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  role: Role;
  reportManagerId?: string;
  joiningDate?: Date;

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
  leavePolicyId: string;
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
