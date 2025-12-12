import { prisma } from "@/libs/prisma";
import { Leave } from "@prisma/client";
import { getLeaves } from "./getLeaves";
export const getLeave = async (leaveId: string) => {
  const leaves = (await getLeaves()) || [];

  let leave = leaves.find((leave: Leave) => leave.id === leaveId);
  if (leave) {
    return leave;
  }
  return prisma.leave.findFirst({
    where: {
      id: leaveId,
    },
    include: {
      applicant: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
      actionBy: true,
    },
  });
};
