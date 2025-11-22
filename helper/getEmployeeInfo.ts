import { prisma } from "@/libs/prisma";

const getEmployeeInfo = async (id: string) => {
  try {
    return await prisma.employee.findFirst({
      where: { id },
      include: { assignMembers: true, leavesApplied: true },
    });
  } catch (error) {
    console.error("Employee existence check error:", error);
    return null;
  }
};
export default getEmployeeInfo;
