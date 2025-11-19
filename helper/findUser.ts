import { prisma } from "../libs/prisma";
export const findUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  const exists = user ? true : false;
  return { exists };
};
