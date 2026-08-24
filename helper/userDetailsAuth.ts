import { prisma } from "@/libs/prisma";
import { Role } from "@prisma/client";

/**
 * Shared authorization for the "User Details" management feature.
 *
 * Only ADMIN and REPORT_MANAGER may view/edit user details.
 * - ADMIN          → any employee.
 * - REPORT_MANAGER → only employees whose reportManagerId === their own
 *                    employee id.
 *
 * These checks run on every request so the UI restriction can't be bypassed
 * by calling the API directly with someone else's employeeId.
 */

export type Requester = { id: string; role: Role };

// Resolve the logged-in user's employee record from their User id.
export const getRequester = async (
  userId: string,
): Promise<Requester | null> =>
  prisma.employee.findFirst({
    where: { userId },
    select: { id: true, role: true },
  });

export const isManagerRole = (role: Role): boolean =>
  role === Role.ADMIN || role === Role.REPORT_MANAGER;

// Can this requester manage the target employee?
export const canManage = (
  requester: Requester,
  target: { reportManagerId: string | null },
): boolean =>
  requester.role === Role.ADMIN ||
  target.reportManagerId === requester.id;

// Prisma `where` scope limiting which employees a requester may see.
export const scopeWhere = (requester: Requester) =>
  requester.role === Role.ADMIN ? {} : { reportManagerId: requester.id };
