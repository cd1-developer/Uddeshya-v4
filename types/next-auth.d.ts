// types/next-auth.d.ts
import { Role } from "@/interfaces";
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    email: string;
    role: Role;
    employee_id: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      username: string;
      email: string;
      role: Role;
      employee_id: string;
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
    employee_id: string;
  }
}
