import { Role } from "@/interfaces";

export const mapRole = (role: string) => {
  switch (role) {
    case "ADMIN":
      return Role.ADMIN;
    case "SUB_ADMIN":
      return Role.SUB_ADMIN;
    case "REPORT_MANAGER":
      return Role.REPORT_MANAGER;
    case "MEMBER":
      return Role.MEMBER;
  }
};
