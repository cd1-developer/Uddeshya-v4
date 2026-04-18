// types/next-auth.d.ts
import { EmployeeStatus, Role } from "@/interfaces";
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    email: string;
    role?: Role;
    employee_id: string | undefined;
    reportManagerId: string | null;
    status: EmployeeStatus;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      username: string;
      email: string;
      role?: Role;
      employee_id: string | undefined;
      reportManagerId: string | null;
      status: EmployeeStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    email: string;
    role: Role;
    employee_id: string | undefined;
    reportManagerId: string | null;
    status: EmployeeStatus;
  }
}
