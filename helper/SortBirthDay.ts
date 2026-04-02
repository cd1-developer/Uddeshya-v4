import { UpComingDOBType } from "@/interfaces";

export const sortBirthDay = (UpComingDOB: UpComingDOBType[]) => {
  return UpComingDOB.sort((a, b) => {
    const aDOB = new Date(a.dateOfBirth);
    const bDOB = new Date(b.dateOfBirth);

    const aMonth = aDOB.getMonth(); // 0-11
    const bMonth = bDOB.getMonth();

    if (aMonth !== bMonth) {
      return aMonth - bMonth; // ASC by month
    }

    const aDay = aDOB.getDate();
    const bDay = bDOB.getDate();

    return aDay - bDay; // ASC by day
  });
};
